//Objeto en el que vamos a guardar los datos relevantes para
//el cliente, al principio estará en null y se actualizara cuando
//recibamos el evento gameStart desde el servidor

let currentGame = {
  id: null,
  color: null,
  opponent: null,
  isMyTurn: false,
  //El Set es una estructura de datos parecida a los array clásicos
  //pero con funciones útiles que nos van a servir de ayuda más adelante
  usedPieces: new Set()
};

//Creamos una conexión en tiempo real entre el navegador y el servidor
//usando la librería socket.io, al usar el io() sin ningún argumento
//nos conectamos al mismo servidor desde el que se cargó la página

const socket = io();

//Pillamos las referencias a diferentes elementos del dom

const searchPanel = document.getElementById('searchPanel');
const gameInfo = document.getElementById('gameInfo');
const searchButton = document.getElementById('searchButton');
const playerNameInput = document.getElementById('playerName');
const turnMessage = document.getElementById('turnoMensaje');
const redPiecesCounter = document.getElementById('fichasRojas');


//Lo que hacemos aquí es configurar el desplegable que nos muestre la tabla
//de debilidades de las fichas, lo hacemos de manera que al pulsar el botón
//salga una imagen con una cruz arriba y que al pulsar la cruz se cierre el desplegable
document.getElementById('toggleButton').addEventListener('click', function() {
  document.getElementById('imagenPopup').style.display = 'block';
});

document.querySelector('.cruz').addEventListener('click', function() {
  document.getElementById('imagenPopup').style.display = 'none';
});

//Esta función controla si se puede arrastrar una pieza o no, en caso de estar
//permitido arrastrarla (es tu turno y no has usado la pieza) coge los datos
//necesarios que se enviarán al soltarla, el event que tiene como parámetro
//lo genera directamente el navegador ya que en nuestro html tenemos puesto el atributo
//ondragstart="dragStart(event)" que activa ese evento automáticamente
function dragStart(event) {
  //Si no es tu turno o ya usaste la pieza, no te permite arrastrarla, anula
  //su comportamiento estándar que sería que podría ser arrastrada
  if (!currentGame.isMyTurn || currentGame.usedPieces.has(event.target.id)) {
    event.preventDefault();
    return;
  }

  //Cogemos los datos del tipo y el color de la ficha, están puestos en el html
  //en el orden que se muestra abajo
  const pieceType = event.target.classList[1];
  const pieceColor = event.target.classList[0];

  //Como el dato del color que estamos jugando y el de las clases de las fichas
  //están uno en español y las otras en inglés hacemos una conversión rápida
  //con un operador ternario
  const playerColorClass = currentGame.color === 'Azul' ? 'blue' : 'red';

  //Si la pieza que estás intentando mover es de otro color al que te ha tocado
  //jugar, no te deja arrastrarla
  if (pieceColor !== playerColorClass) {
    event.preventDefault();
    return false;
  }

  //Usamos un método del objeto DataTransfer que es una propiedad del html
  //que nos permite al arrastrar y luego dropear almacenar una información
  event.dataTransfer.setData("text", event.target.id);
  event.dataTransfer.setData("type", pieceType);
  event.dataTransfer.setData("color", pieceColor);
  //Le ponemos un timeout de 0 para que le de tiempo a cargar la "animación"
  //que le hemos puesto en el css
  setTimeout(() => event.target.classList.add('dragging'), 0);
}

//Se ejecuta automáticamente cuando termina de arrastarse una pieza y
//finaliza la animación
function dragEnd(event) {
  event.target.classList.remove('dragging');
}

//Te permite soltar solo si es tu turno y si la celda en la que quieres
//soltar la ficha esta vacía
function allowDrop(event) {
  if (currentGame.isMyTurn && !event.target.querySelector('img')) {
    event.preventDefault();
    event.target.classList.add('drop-hover');
  }
}

//Elimina el color que deja la ficha cuando pasas por una casilla y 
function endAllowDrop(event) {
  event.target.classList.remove('drop-hover');
}


function drop(event) {
  event.preventDefault();
  event.target.classList.remove('drop-hover');

  //Si no hay partida activa o no es tu turno, no se hace nada
  if (!currentGame.id || !currentGame.isMyTurn)
    return;

  //Cogemos los datos que habíamos subido antes cuando hemos cogido
  //una ficha en el dragStart
  const pieceId = event.dataTransfer.getData("text");
  const pieceType = event.dataTransfer.getData("type");
  const cell = event.target;

  //Hace varias comprobaciones de que la celda existe, que tiene un id y
  //que tiene la clase celda en el css para evitar posibles bugs
  if (!cell || !cell.id || !cell.id.startsWith('cell'))
    return;

  //Si la celda tiene una imágen, no te deja soltarla
  if (cell.querySelector('img'))
    return;

  //Saca la posición en el array del tablero basándose en la celda donde
  //hemos soltado la pieza
  const position = parseInt(cell.id.replace('cell', '')) - 1;
  //Pilla el elemento del html por su id (la hemos metido antes en una variable local)
  const pieceElement = document.getElementById(pieceId);

  //Un checkeo de prevención por si acaso falla algo de lo anterior, comprobamos
  //si existe el elemento que acabamos de soltar
  if (!pieceElement)
    return;

  //Añadimos la pieza usada al array de piezas usadas
  currentGame.usedPieces.add(pieceId);
  //Le damos la clase used a la pieza
  pieceElement.classList.add('used');
  //Calcula el índice de la pieza que acabo de soltar dentro de las piezas 
  //que están colocadas en el html
  const pieceIndex = Array.from(pieceElement.parentElement.parentElement.querySelectorAll('img')).indexOf(pieceElement);

  //Enviamos todos los datos necesarios al servidor para procesar el movimiento
  socket.emit('move', {
    gameId: currentGame.id,
    position: position,
    type: pieceType,
    //De que jugador es
    color: currentGame.color,
    //Que pieza fue usada
    pieceIndex: pieceIndex
  });

  //Cambio de turno
  currentGame.isMyTurn = false;
}

//Inicializa el tablero de 0 y prepara las piezas para la partida
function setupBoard() {
  for (let i = 1; i <= 36; i++) {
    const cell = document.getElementById(`cell${i}`);
    cell.innerHTML = '';
    cell.className = '';
    //Permite a las celdas tener sus propiedades de 0, como si nunca hubieran
    //interactuado con ellas
    cell.addEventListener('dragenter', allowDrop);
    cell.addEventListener('dragover', allowDrop);
    cell.addEventListener('dragleave', endAllowDrop);
  }

  //Limpia el registro de piezas usadas, con un set nuevo
  currentGame.usedPieces = new Set();

  //Elimina todos los estilos relacionados a piezas usadas
  //y se asegura de que se quite el estilo dragging con el listener de dragend
  document.querySelectorAll('#tablaRoja img, #tablaAzul img').forEach(img => {
    img.classList.remove('used');
    img.addEventListener('dragend', dragEnd);
  });
}

function updateBoard(gameState) {
  // Recorre todas las posiciones del tablero (0 a 35)
  gameState.board.forEach((cell, index) => {
    //Selecciona la celda correspondiente
    const cellElement = document.getElementById(`cell${index + 1}`);
    //Limpia el contenido anterior para actualizarlo luego
    cellElement.innerHTML = '';

    //Si la celda tiene una pieza dentro
    if (cell) {
      //Crea una imagen nueva 
      const img = document.createElement('img');
      // Elige sufijo para el archivo según el color con un operador ternario
      const colorSuffix = cell.color === 'Azul' ? 'azul' : 'rojo';
      //Guarda el tipo de la pieza en una variable para usarlo en las
      //siguientes líneas
      const type = cell.type;
      //Saca la imágen a través de la ruta
      img.src = `/archivos/elementos/${type}${colorSuffix}.png`;
      //Le añadimos la clase a la imagen para su estilo y la lógica del programa
      img.className = `${colorSuffix === 'azul' ? 'blue' : 'red'} ${type}`;
      //Le ponemos un texto alternativo por si no carga la imágen
      img.alt = `${type}${colorSuffix}`;
      //La propiedad de si se puede agarrar se pone en false ya que ya estará puesta
      //en su tablero
      img.draggable = false;
      //Añadimos la imágen en su respectiva celda en el DOM
      cellElement.appendChild(img);

    }
  });

  // Resalta las celdas donde hubo interacciones con color amarillo
  // Si hubo interacciones entra
  if (gameState.interactions && gameState.interactions.length > 0) {
    gameState.interactions.forEach(interaction => {
      const cellElement = document.getElementById(`cell${interaction.position + 1}`);
      if (cellElement) {
        //Se suaviza la animación
        cellElement.style.transition = 'background-color 0.3s';
        //Se pone el fondo amarillo sobre la pieza y las adyacentes
        cellElement.style.backgroundColor = '#ffff99';
        //Se acaba la animación a los 0.5 segundos
        setTimeout(() => { cellElement.style.backgroundColor = ''; }, 500);
      }
    });
  }

  //Comprueba el estado del turno (si es tu turno o el del rival)
  const isMyTurn = gameState.currentTurn === currentGame.color;
  //Actualiza el estado interno del turno
  currentGame.isMyTurn = isMyTurn;
  //Lo muestra en pantalla
  turnMessage.textContent = `Turno del ${gameState.currentTurn.toLowerCase()}`;


  const redPieces = gameState.board.filter(cell => cell && cell.color === 'Rojo').length;
  const bluePieces = gameState.board.filter(cell => cell && cell.color === 'Azul').length;

  // Habilita o deshabilita tus piezas según el turno
  const myColor = currentGame.color === 'Azul' ? 'blue' : 'red';
  document.querySelectorAll(`#tablaRoja img.${myColor}, #tablaAzul img.${myColor}`).forEach(img => {
    // Si la pieza aún no se ha usado
    if (!currentGame.usedPieces.has(img.id)) {
      // Solo puedes mover si es tu turno
      img.draggable = isMyTurn;
      // Añade o quita clase 'disabled' según el turno
      img.classList.toggle('disabled', !isMyTurn);
    } else {
      img.draggable = false; // Si ya se usó, no se puede mover
      img.classList.add('used'); // Marca visualmente como usada
    }
  });
}

//Función para resetear el el juego en el cliente
function resetGame() {
  //Volvemos a poner en null la variable que guarda la información
  //de la partida
  currentGame = {
    id: null,
    color: null,
    opponent: null,
    isMyTurn: false,
    usedPieces: new Set()
  };

  //Muestro el panel de busqueda de partida
  searchPanel.style.display = 'flex';
  //Oculto la información de la partida
  gameInfo.style.display = 'none';
  //Muestro el botón de búsqueda
  searchButton.disabled = false;
  //Reseteo las clases que le habíamos puesto a las piezas
  document.querySelectorAll('#tablaRoja img, #tablaAzul img').forEach(img => {
    img.classList.remove('used', 'disabled', 'dragging');
    img.draggable = true;
  });

  //Ejercuto la función setupBoard explicada más arriba
  setupBoard();
  // Ocultar el área de juego correctamente
  const gameArea = document.getElementById('gameArea');
  gameArea.style.display = 'none';
}

//Pongo un listener en el botón de buscar partida para mandarle
//al servidor un mensaje de que un usuario quiere entrar a la cola
//de búsqueda
searchButton.addEventListener('click', () => {
  const name = playerNameInput.value.trim();

  //Si el nombre esta vacío que lo vuelva a meter
  if (!name)
    return alert("Ingresa un nombre");
  //Muestro el gif de búsqueda
  document.getElementById('loading').style.display = 'block';
  searchButton.disabled = true;
  //Envío el evento al servidor
  socket.emit('find', { name: name });
});

//Listener del socket.io que recibe el evento gameStart del servidor
socket.on('gameStart', (data) => {
  // Mostrar el área de juego quitando el hidden correctamente
  const gameArea = document.getElementById('gameArea');
  gameArea.hidden = false;
  gameArea.style.display = '';
  //Se inicializa el objeto contenedor de la información con lo que nos pase
  //el servidor
  currentGame = {
    id: data.gameId,
    color: data.color,
    opponent: data.opponent,
    isMyTurn: data.color === 'Azul',
    usedPieces: new Set()
  };
  //Se oculta el panel de búsqueda
  searchPanel.style.display = 'none';
  //Se oculta la información de la partida
  gameInfo.style.display = 'none';
  document.getElementById('playerColor').textContent = data.color;
  document.getElementById('opponentName').textContent = data.opponent;
  document.getElementById('loading').style.display = 'none';
  document.getElementById('currentTurn').textContent = 'Azul';
  setupBoard();

  turnMessage.textContent = 'Turno del azul';

  const tablaRoja = document.getElementById("tablaRoja");
  const tablaAzul = document.getElementById("tablaAzul");

  //Sacamos el color que somos para ocultar las fichas del rival
  if (currentGame.color === "Azul") {
    tablaRoja.style.display = 'none';
  } else {
    tablaAzul.style.display = 'none';
  }


  const myColor = currentGame.color === 'Azul' ? 'blue' : 'red';
  document.querySelectorAll(`#tablaRoja img.${myColor}, #tablaAzul img.${myColor}`).forEach(img => {
    img.draggable = currentGame.isMyTurn;
    img.classList.toggle('disabled', !currentGame.isMyTurn);
  });

});

//Cuando reciba el evente del servidor de que ha habido una actualización, que actualice el tablero
socket.on('gameUpdate', (gameState) => {
  updateBoard(gameState);
});

//Si recibe del server que ha acabado la partida, que muestre las piezas de cada uno y pregunte
//al jugador si quiere buscar una nueva partida
socket.on('gameEnd', (data) => {
  const result = `${data.status}. Piezas Rojas: ${data.redPieces}, Piezas Azules: ${data.bluePieces}`;
  setTimeout(() => {
    if (confirm(`Juego terminado.\n${result}\n\n¿Quieres buscar una nueva partida?`)) {
      resetGame();
    }
  }, 1000);
});

//Si recibe del servidor que el oponente se ha desconectado, que diga que has ganado y te 
//pregunte si quieres buscar otra partida
socket.on('opponentDisconnected', (data) => {
  setTimeout(() => {
    if (confirm(`Tu oponente ${data.opponentName} se ha desconectado. ¡Has ganado!\n\n¿Quieres buscar una nueva partida?`)) {
      resetGame();
    }
  }, 500);
});

