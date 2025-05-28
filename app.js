//Cargamos el framework Express, que nos permite crear
//servidores web fácilmente
const express = require("express");

//Creamos el servidor que vamos a usar con express y lo nombramos
//app, esto nos permitirá hacer recibir peticiones del front
//y responder con diferentes datos

const app = express();

//Cargamos el módulo Path de NodeJS que nos permite trabajar y acceder
//a diferentes archivos o carpetas, lo usaremos más adelante
//para encontrar archivos html y directorios para lanzar la web

const path = require("path");

//Cargamos http, otro módulo de NodeJS que nos va a permitir crear
//el servidor que entienda el protocolo HTTP

const http = require("http");

//Cargamos Server de la librería socket.io que nos va a permitir
//tener una comunicación en tiempo real para nuestro juego

const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

//Le decimos al servidor que cuando tenga que encontrar archivos
//busque en la carpeta src, esto va a servir por ejemplo para que cuando
//se quiera acceder a la página principal, index.js el servidor
//sepa interpretarla y no salga error 404

app.use(express.static(path.join(__dirname, "src")));

//Creamos las variables que almacenen los jugadores que estén buscando
//partida y los juegos que hay ahora mismo en curso

let waitingPlayers = [];
let games = [];

//Con io.on le estamos diciendo que cuando se realice una conexión con el servidor
//ejecute este código, el parámetro socket representa la conexión individual del
//cliente con nuestro servidor

io.on("connection", (socket) => {
  //Ponemos por consola que se ha establecido una conexión y mostramos
  //su id que será un identificador único que le otorga socket.io
  console.log("Nueva Conexión", socket.id);

  //Socket.on actuará de listener para cuando el cliente mande el evento find,
  //que es básicamente cuando el jugador haga click en buscar partida,
  //data es el parámetro que contiene los datos enviados por el cliente
  socket.on("find", (data) => {
    //Imprimimos en la consola el jugador que está buscando partida
    console.log("Jugador buscando partida", data.name);

    //Hacemos una comprobación de que nos ha llegado un dato que existe y
    //de que el nombre no está vacío o lleno de espacios
    if (data.name && data.name.trim()) {
      //Añadimos el nombre del jugador y el id de su conexión al array
      //que hicimos al principio de los jugadores que están esperando a
      //encontrar partida
      waitingPlayers.push({ name: data.name, id: socket.id });
      //Imprimimos cuántos jugadores hay buscando
      console.log("Jugadores esperando:", waitingPlayers.length);

      //Cuando haya dos jugadores en cola, los metemos en una partida
      if (waitingPlayers.length >= 2) {
        //Sacamos a los dos del array y los guardamos en p1 y p2
        const p1 = waitingPlayers.shift();
        const p2 = waitingPlayers.shift();

        //Creamos un objeto con toda la información de la partida
        const newGame = {
          //Le damos una id única a la partida haciendo la resta entre las dos ids
          id: `${p1.id}-${p2.id}`,
          //Guardamos los datos de los dos jugadores
          players: {
            //Ponemos el id entre corchetes que nos permite que el nombre no sea una
            //propiedad fija si no que venga de una variable
            [p1.id]: {
              name: p1.name,
              color: "Azul",
              socket: p1.id,
              //Inicializamos un array de las piezas del jugador
              pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
            },
            //Hacemos lo mismo con el segundo jugador
            [p2.id]: {
              name: p2.name,
              color: "Rojo",
              socket: p2.id,
              pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
            }
          },
          //Creamos un array que represente el tablero y ponemos que todos
          //sus valores empiecen con nulo
          board: Array(36).fill(null),
          //El jugador azul siempre empieza moviendo así que el primer turno
          //será Azul
          currentTurn: "Azul",
          status: "playing",
          moveCount: 0
        };

        //Metemos la partida en nuestro array de partidas
        games.push(newGame);
        //Y lo imprimimos en la terminal
        console.log("Nueva partida creada", newGame.id);

        //Enviamos un evento al jugador 1, que identificamos a través de su id
        //el jugador 1 recibirá este mensaje con un evento que debe estar escuchando
        io.to(p1.id).emit("gameStart", {
          opponent: p2.name,
          color: "Azul",
          gameId: newGame.id
        });

        //Hacemos lo mismo para el jugador 2
        io.to(p2.id).emit("gameStart", {
          opponent: p1.name,
          color: "Rojo",
          gameId: newGame.id
        });
      } else {
        //Si solo hay un jugador esperando, avisamos al cliente de que espere,
        //esto es lo que hace que luego salga el gif de una pokeball girando que 
        //representa la espera
        socket.emit("waitingForOpponent");
      }
    }
  });

  //Esto es un listener que espera el movimiento realizado por alguno del los jugadores
  socket.on("move", (data) => {
    //Imprimimos el movimiento recibido
    console.log("Movimiento recibido:", data);
    //Busca de que partida es el movimiento obtenido, antes la duda g es una
    //variable temporal que usa la función find para recorrer el array y 
    //encontrar la partida
    const game = games.find(g => g.id === data.gameId);

    //Ahora vamos a poner unos checkeos que nos prevengan de diferentes posibles
    //errores que ocurran en el cliente como que se envie un movimiento no valido
    //o que el juego desde que se envia no se encuentra en nuestro array

    //Checkeo de seguiridad de que la partida existe
    if (!game || game.status !== "playing") {
      console.log("La partida no ha sido encontrada o no está activa")
      return;
    }

    //Checkeo de que has movido la ficha en tu turno
    if (game.currentTurn !== data.color) {
      console.log("No es el turno de ese jugador")
      //Envia un evento al cliente, cuando el cliente lo reciba te notificará
      //del error con un alert
      socket.emit("invalidMove", { reason: "No es tu turno" })
      return;
    }

    //Checkeo de que la posición donde has puesto la ficha no es válida
    if (data.position < 0 || data.position >= 36 || game.board[data.position] != null) {
      console.log("Posición inválida");
      socket.emit("invalidMove", { reason: "Posición inválida" });
      return;
    }

    //Checkeo de que la pieza que ha movido no la haya usado antes
    const player = game.players[socket.id];
    if (!player || !player.pieces.includes(data.pieceIndex)) {
      console.log("Pieza inválida o ya usada");
      socket.emit("invalidMove", { reason: "Pieza inválida o ya usada" });
      return;
    }

    //Quitamos de la lista la pieza que se acaba de usar,con filter devolvemos
    //el array con todas las piezas distintas a la usada, es decir la eliminamos
    player.pieces = player.pieces.filter(p => p !== data.pieceIndex);

    //Guardamos la jugada con su información en el tablero, guardamos tipo,
    //color, y índice tanto de la posición en el tablero como de la posición
    //en nuestras propias fichas
    game.board[data.position] = {
      type: data.type,
      color: data.color,
      index: data.pieceIndex
    };

    //Aumentamos los movimientos realizado
    game.moveCount++;

    //Comprobamos si ha habido alguna interacción donde nuestra ficha
    //ha capturado a otra del oponente mediante la función checkInteractions,
    //que está definida más adelante
    const interactions = checkInteractions(game, data.position);

    //Cambiamos el turno de la partida, lo hemos puesto con un operador ternario
    //para que sea más elegante pero funciona un if else normal, si es azul
    //cambia a rojo y si es rojo cambia a azul
    game.currentTurn = game.currentTurn === "Azul" ? "Rojo" : "Azul";

    //Enviamos al los clientes (los dos jugadores) la información del movimiento recibido,
    //para que actualice ambos tableros igual y que reciba las interacciones
    //que ha provocado la ficha por si ha capturado otras para que se muestren en ambos
    //tableros

    const playerIds = Object.keys(game.players);
    playerIds.forEach(playerId => {
      io.to(playerId).emit("gameUpdate", {
        board: game.board,
        currentTurn: game.currentTurn,
        status: game.status,
        interactions: interactions
      });
    });

    //Después de cada movimiento recibido, hacemos una comprobación
    //de si la partida ha teminado tras ese movimiento
    checkGameEndConditions(game);
  });

  //Listener que espera al evento disconnect que gestiona lo que ocurre cuando
  //uno de los jugadores se desconecta del servidor
  socket.on("disconnect", () => {
    //Imprimimos el mensaje de desconcexión
    console.log("Player disconnected:", socket.id);

    //Si el jugador se encuentra en la cola buscanado partida lo saca del array
    waitingPlayers = waitingPlayers.filter(p => p.id !== socket.id);

    //Comprueba si el jugador que se ha desconectado estaba en una partida
    //activa
    const playerGame = games.find(g => g.players[socket.id] && g.status === "playing");


    //Si el jugador estaba en una partida
    if (playerGame) {

      //Obtenemos el id del oponente
      const opponentId = Object.keys(playerGame.players).find(id => id !== socket.id);

      //Comprobación extra de que exista una partida vacia o de que justo se haya
      //ido el otro también

      if (opponentId) {
        //Enviamos el evento al cliente diciendole el nombre del oponente
        //que se desconecto
        io.to(opponentId).emit("opponentDisconnected", {
          gameId: playerGame.id,
          opponentName: playerGame.players[socket.id].name
        });

        //Actualizamos el estado de la partida
        playerGame.status = `${playerGame.players[opponentId].color} gana por desconcexión`;
      }
    }
  })
})

//Definimos funciones

//Función que evalua si la pieza recién puesta tiene algún tipo de interacción
//con sus piezas adyacentes

function checkInteractions(game, position) {
  //Guardamos la pieza que hemos colocado en una variable
  const placedPiece = game.board[position];
  //Comprobación de precaución por si por lo que fuera no hay información sobre la pieza
  if (!placedPiece)
    return [];

  //Creamos un array donde guardaremos las posibles interacciones de cada
  //casilla adyacente
  const interactions = [];
  const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
  ];

  //Definimos tamaño del ancho del tablero para hacer las cuentas
  //con intención de interpretar el tablero como una matriz
  const boardWidth = 6;
  //Un poco de matemáticas
  //El resto de la división entre el número de celda y el ancho
  //del tablero nos da la columna donde esta (x)
  const cellX = position % boardWidth;
  //La división entre el número de celda y el ancho sin contar los 
  //decimales nos dará la fila (y)
  const cellY = Math.floor(position / boardWidth);

  //Comprobamos las 4 direcciones
  directions.forEach(dir => {
    //Calcula la celda vecina con la dirección actual
    const adjX = cellX + dir.x;
    const adjY = cellY + dir.y;

    //Nos aseguramos de que la posible celda este entra las coordenadas
    //0 y 5 tanto en x como en y porque los limites del tablero
    //son de 0 a 5 (6 de anchura)
    if (adjX >= 0 && adjX < boardWidth && adjY >= 0 && adjY < boardWidth) {
      const adjPos = adjY * boardWidth + adjX;
      const adjPiece = game.board[adjPos];

      //Si no hay pieza adjunta en la dirección que checkemos o es de nuestro
      //color no hacemos nada más
      if (!adjPiece || adjPiece.color === placedPiece.color)
        return;

      //Si es de un color diferente vamos a comprobar sus debilidades
      //para ver si capturamos o no la ficha
      const debilidades = getDebilidades(adjPiece.type);
      if (debilidades.includes(placedPiece.type)) {
        interactions.push({
          position: adjPos,
          from: adjPiece.color,
          to: placedPiece.color,
          type: adjPiece.type
        });

        //Cambiamos el color de la pieza capturada directamente en el tablero
        adjPiece.color = placedPiece.color;
      }
    }
  });
  return interactions;
}

//Función que sirve para sacar las debilidades de cada tipo
function getDebilidades(tipo) {
  const debilidades = {
    normal: ["lucha"],
    fuego: ["agua", "tierra", "roca"],
    agua: ["electrico", "planta"],
    planta: ["fuego", "hielo", "veneno", "volador", "bicho"],
    electrico: ["tierra"],
    hielo: ["fuego", "lucha", "roca", "acero"],
    lucha: ["volador", "psiquico", "hada"],
    veneno: ["tierra", "psiquico"],
    tierra: ["agua", "planta", "hielo"],
    volador: ["electrico", "hielo", "roca"],
    psiquico: ["bicho", "fantasma", "siniestro"],
    bicho: ["fuego", "volador", "roca"],
    roca: ["agua", "planta", "lucha", "tierra", "acero"],
    fantasma: ["fantasma", "siniestro"],
    dragon: ["hielo", "dragon", "hada"],
    acero: ["fuego", "lucha", "tierra"],
    siniestro: ["lucha", "bicho", "hada"],
    hada: ["acero", "veneno"]
  };

  return debilidades[tipo];
}

function checkGameEndConditions(game) {
  const filledCells = game.board.filter(cell => cell !== null).length;

  if (filledCells === 36) {
    //Sacamos la cantidad de fichas de cada color que hay en el tablero
    const redPieces = game.board.filter(cell => cell && cell.color === "Rojo").length;
    const bluePieces = game.board.filter(cell => cell && cell.color === "Azul").length;

    //Dependiendo de quien ha acabado con más piezas al final de la partida
    //declarar un ganador
    if (redPieces > bluePieces) {
      game.status = "El rojo Gana";
    } else if (bluePieces > redPieces) {
      game.status = "El azul Gana";
    } else {
      game.status = "Empate";
    }

    //Metemos los identificadores de cada jugador (sus ids dadas por el socket)
    const playerIds = Object.keys(game.players);
    //Le enviamos a ambos un evento avisando que la partida ha teminado
    //y mostrando a un ganador o el empate
    playerIds.forEach(playerId => {
      io.to(playerId).emit("gameEnd", {
        status: game.status,
        redPieces,
        bluePieces,
      });
    });
  }
}

//Que el servidor abra automáticamente index.html que está en la carpeta src 
//al abrir la página
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "src", "index.html")));
//Inicia el servidor en el puerto 3000 y se imprimer por consola el aviso
server.listen(3000, '0.0.0.0', () => console.log("Servidor en puerto 3000"));
