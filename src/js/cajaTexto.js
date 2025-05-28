// ======= Selección de elementos del DOM =======
const cajaDialogo = document.getElementById('cajaDialogo');
const dialogText = document.getElementById('dialogText');
const triangulo = document.getElementById('triangulo');
const fichasRojas = document.getElementById("tablaRoja");
const celdaVerde = document.getElementById("cell15");
const celdaFuego = document.getElementById("cell16");
const celdaFuego2 = document.getElementById("cell14");
const celdaFuego3 = document.getElementById("cell9");
const celdaFuego4 = document.getElementById("cell21");
const tierraRoja = document.getElementById("tierraRojo");
const rocaRoja = document.getElementById("rocaRojo");
const aguaRoja = document.getElementById("aguaRojo");
const imagen = document.getElementById('fuegoAzul');
const destino = document.getElementById('cell16');
const colocable = document.getElementById('cell10');
const colocable2 = document.getElementById('cell17');
const colocable3 = document.getElementById('cell22');
let clickable = true;
let divclic = document.getElementById("infoClick");
let botonSaltar = document.getElementById("saltar");
let fuegoColocado = false;
let tierraAguaRocaColocado = false;

// ======= Diálogos del tutorial =======
const dialogos0 = [ "" ];
const dialogos = [
  "...",
  "Saludos Jugador!",
  "Bienvenido a PokeTactix, un juego de mesa basado en Pokemon!",
  "Alguna vez has jugado al juego de mesa chino Go? Esto es algo parecido.",
  "Empecemos con un pequeño tutorial sobre el juego...",
  "Comenzaré por lo básico.",
  "Esto es un juego por turnos, en el que a cada jugador se le asignará un Color. En cada turno colocas una de tus fichas en el tablero central.",
  "Cuando todas las casillas del tablero estén llenas, se hará un recuento de quién tiene más fichas de su color.",
  "Echale un vistazo al tablero!"
];
const dialogos2 = [
  "",
  "En este tutorial, tus fichas serán las rojas.",
  "Prueba a arrastrar tu ficha roja \"fuego\" a la celda verde."
];
const dialogos3 = [
  "",
  "¡Genial! Una vez que coloques tu ficha, no podrás volver a moverla de sitio durante esta partida, así que...",
  "¡Piensa bien dónde colocas cada una de tus fichas!",
  "Cada vez que coloques una ficha, generarás una reacción en forma de cruz, por lo que tu ficha afectará a las casillas contiguas durante este turno de la siguiente manera:"
];
const dialogos4 = [
  "",
  "Ahora me toca a mi! Colocaré mi fuego azul al lado de tu fuego rojo.",
  "Aunque...",
  "Fuego no es eficaz contra fuego, por lo que la reacción no generará ninguna interacción.",
  "El elemento colocado solo creará una reacción efectiva si se encuentra al lado de un elemento enemigo débil."
];
const dialogos5 = [
  "",
  "Vuelve a ser tu turno! Vamos a probar a hacer una reacción.",
  "Fuego tiene 3 debilidades: tierra, agua y roca",
  "Prueba a arrastrar cualquiera de esas fichas de tu color, y colócala en cualquier casilla contigua a mi fuego azul!",
  "Eso provocará que mi fuego se debilite y se vuelva de tu color!"
];
const dialogos6 = [
  "",
  "Bien hecho!",
  "Así es como capturas fichas enemigas, colocando elementos que sean eficaces contra ellas.",
  "Tu única forma de ataque es tu turno, por lo que solo podrás obtener fichas enemigas en él.",
  "Trata de colocar estratégicamente tus fichas para que tu rival no te quite más de una ficha en un solo turno, cada una de ellas cuenta para la puntuacion final!",
  "En las partidas normales siempre tendrás un botón a la derecha para revisar la tabla de tipos, por si no la recuerdas bien.",
  "Y eso es todo lo que debes saber sobre el juego, experimenta por tu cuenta o inventa estrategias en partidas normales!"
];

let cajaDialogoActual = dialogos;
let currentDialog = 0;
let currentChar = 0;
let isTyping = false;

const typeSound = document.getElementById('typeSound');
const sonidoFinal = document.getElementById('sonidoFinal');
let trainerRed = document.getElementById("red");

// ======= Función que hace que las letras se escriban 1 a 1, para dar efecto de maquina de escribir =======
function typeWriter(dialogo) {
  clickable = false;
  if (currentChar < dialogo[currentDialog].length) {
    dialogText.textContent += dialogo[currentDialog].charAt(currentChar);
    typeSound.play();
    currentChar++;
    setTimeout(() => typeWriter(dialogo), 25);
  } else {
    isTyping = false;
    clickable = true;
    triangulo.classList.remove('hidden');
    typeSound.pause();
    typeSound.currentTime = 0;
  }
}

// ======= Avanzar dialogos =======
function nextDialog(dialogo) {
  if (currentDialog == 0) {
    trainerRed.src = "../archivos/sprites/red2.png";
  }
  if (isTyping) {
    dialogText.textContent = dialogo[currentDialog];
    currentChar = dialogo[currentDialog].length;
    isTyping = false;
    triangulo.classList.remove('hidden');
  } else if (currentDialog < dialogo.length - 1) {
    currentDialog++;
    currentChar = 0;
    dialogText.textContent = '';
    triangulo.classList.add('hidden');
    isTyping = true;
    typeWriter(dialogo);
  }
  // Activar y desactivar la visibilidad de la caja de texto y el personaje para que se pueda ver el tablero
  if (currentDialog == dialogo.length - 1 && isTyping == false) {
    clickable = false;
    trainerRed.src = "../archivos/sprites/red1.png";
    if (dialogo == dialogos) {
      setTimeout(() => toggleOscurecer(), 1000);
      setTimeout(() => toggleOscurecer(), 5000);
      cajaDialogoActual = dialogos2;
      setTimeout(() => mostrarDialogosEnOrden(), 1000);
      currentDialog = 0;
    }
    if (dialogo == dialogos2) {
      setTimeout(() => toggleOscurecer(), 1000);
      cajaDialogoActual = dialogos0;
      habilitarFuegoYCasilla();
    }
    if (dialogo == dialogos3) {
      setTimeout(() => toggleOscurecer(), 0);
      cajaDialogoActual = dialogos0;
      dialogText.textContent = ' ';
      setTimeout(() => efectoFuego(), 1000);
    }
    if (dialogo == dialogos4) {
      setTimeout(() => toggleOscurecer(), 0);
      cajaDialogoActual = dialogos0;
      setTimeout(() => moverImagen(), 1000);
      cajaDialogoActual = dialogos5;
      dialogText.textContent = ' ';
      setTimeout(() => toggleOscurecer(), 5000);
      setTimeout(() => mostrarDialogosEnOrden(), 6000);
    }
    if (dialogo == dialogos5) {
      turno++;
      setTimeout(() => toggleOscurecer(), 0);
      cajaDialogoActual = dialogos0;
      setTimeout(() => activarFichas(), 1000);
      dialogText.textContent = ' ';
    }
    if (dialogo == dialogos6) {
      setTimeout(() => toggleOscurecer(), 0);
      setTimeout(() => pantallaBlanca(), 2000);
    }
  }
}

// ======= Botón para saltar el tutorial =======
botonSaltar.onclick = function() {
  toggleOscurecer();
  pantallaBlanca();
};

// ======= Función para mostrar pantalla blanca y redirigir =======
function pantallaBlanca() {
  document.getElementById("overlayBlanco").className = "active";
  setTimeout(() => window.location.assign("index.html"), 2500);
  sonidoFinal.play();
}

// ======= Inicialización de la pantalla blanca de inicio =======
function pantallaBlancaInicio() {
  document.getElementById("overlayBlancoInicio").className = "noActive";
}
setTimeout(() => pantallaBlancaInicio(), 1000);

// ======= Habilitar fichas para arrastrar y soltar =======
function activarFichas() {
  aguaRoja.draggable = "true";
  tierraRoja.draggable = "true";
  rocaRoja.draggable = "true";
  colocable.setAttribute("ondrop", "soltar(event)");
  colocable.setAttribute("ondragover", "permitirSoltar(event)");
  colocable2.setAttribute("ondrop", "soltar(event)");
  colocable2.setAttribute("ondragover", "permitirSoltar(event)");
  colocable3.setAttribute("ondrop", "soltar(event)");
  colocable3.setAttribute("ondragover", "permitirSoltar(event)");
}

// ======= Evento para avanzar diálogos al hacer clic =======
cajaDialogo.addEventListener('click', () => {
  if (clickable) {
    nextDialog(cajaDialogoActual);
  }
});
cajaDialogo.style.zIndex = 10001;
trainerRed.style.zIndex = 10001;
mostrarDialogosEnOrden();

// ======= Oscurecer/desoscurecer la pantalla para transiciones =======
function toggleOscurecer() {
  let overlay = document.getElementById('overlay');
  overlay.classList.toggle('active');
  cajaDialogo.style.zIndex = cajaDialogo.style.zIndex * -1;
  trainerRed.style.zIndex = trainerRed.style.zIndex * -1;
  if (cajaDialogoActual == (dialogos2)) {
    setTimeout(() => ensenarRojas(), 4000);
  }
  if (cajaDialogoActual == dialogos3 && fuegoColocado == true) {
    setTimeout(() => mostrarDialogosEnOrden(), 1000);
  }
  if (cajaDialogoActual == dialogos4) {
    setTimeout(() => mostrarDialogosEnOrden(), 1000);
  }
  if (cajaDialogoActual == dialogos6 && tierraAguaRocaColocado == true) {
    setTimeout(() => mostrarDialogosEnOrden(), 1000);
  }
}

// ======= Mostrar el bloque de diálogos actual =======
function mostrarDialogosEnOrden() {
  currentDialog = 0;
  dialogText.textContent = " ";
  currentDialog = 0;
  isTyping = true;
  typeWriter(cajaDialogoActual);
}

// ======= Destacar fichas rojas en el tablero =======
function ensenarRojas() {
  fichasRojas.classList.add("noOscurecer");
}
function noEnsenarRojas() {
  fichasRojas.classList.remove("noOscurecer");
}

// ======= Habilitar ficha de fuego y la celda verde =======
function habilitarFuegoYCasilla() {
  setTimeout(() => noEnsenarRojas(), 1001);
  document.getElementById("fuegoRojo").draggable = true;
  setTimeout(() => habilitarCasilla(), 1501);
}
function habilitarCasilla() {
  celdaVerde.style.backgroundColor = "rgb(181, 223, 172)";
}

// ======= Continuar el tutorial =======
function continuarTutorial() {
  dialogText.textContent = " ";
  fuegoColocado = true;
  cajaDialogoActual = dialogos3;
  setTimeout(() => toggleOscurecer(), 1000);
}
function continuarTutorial2() {
  dialogText.textContent = " ";
  tierraAguaRocaColocado = true;
  cajaDialogoActual = dialogos6;
  setTimeout(() => toggleOscurecer(), 1000);
}

// ======= Efecto visual de reacción de fuego =======
function efectoFuego() {
  celdaFuego.style.backgroundColor = "rgb(255, 0, 0)";
  celdaFuego2.style.backgroundColor = "rgb(255, 0, 0)";
  celdaFuego3.style.backgroundColor = "rgb(255, 0, 0)";
  celdaFuego4.style.backgroundColor = "rgb(255, 0, 0)";
  setTimeout(() => volverTransparente(celdaFuego, celdaFuego2, celdaFuego3, celdaFuego4), 1500);
}
function volverTransparente(celda, celda2, celda3, celda4) {
  celda.style.backgroundColor = "transparent";
  celda2.style.backgroundColor = "transparent";
  celda3.style.backgroundColor = "transparent";
  celda4.style.backgroundColor = "transparent";
  cajaDialogoActual = dialogos4;
  setTimeout(() => toggleOscurecer(), 1500);
}

// ======= Variables de estado de la partida =======
let turno = 1;
let azules = 0;
let rojas = 0;
let segundaClaseUltimaFicha = "";
let primeraClaseUltimaFicha = "";
const iconosAzules = document.querySelectorAll(".blue");
const iconosRojos = document.querySelectorAll(".red");

// ======= Debilidades por tipo =======
const debilidadesNormal = ["lucha"];
const debilidadesVolador = ["electrico", "hielo", "roca"];
const debilidadesTierra = ["agua", "hielo", "planta"];
const debilidadesBicho = ["volador", "roca", "fuego"];
const debilidadesAcero = ["tierra", "lucha", "fuego"];
const debilidadesAgua = ["electrico", "planta"];
const debilidadesElectrico = ["tierra"];
const debilidadesHielo = ["acero", "lucha", "roca", "fuego"];
const debilidadesSiniestro = ["lucha", "hada"];
const debilidadesLucha = ["volador", "psiquico", "hada"];
const debilidadesVeneno = ["tierra", "psiquico"];
const debilidadesRoca = ["tierra", "acero", "agua", "lucha", "planta"];
const debilidadesFantasma = ["siniestro", "fantasma"];
const debilidadesFuego = ["tierra", "agua", "roca"];
const debilidadesPlanta = ["volador", "hielo", "veneno", "fuego", "bicho"];
const debilidadesPsiquico = ["siniestro", "fantasma", "bicho"];
const debilidadesDragon = ["hielo", "dragon", "hada"];
const debilidadesHada = ["acero", "veneno"];
const debilidades = {
  normal: debilidadesNormal,
  volador: debilidadesVolador,
  tierra: debilidadesTierra,
  bicho: debilidadesBicho,
  acero: debilidadesAcero,
  agua: debilidadesAgua,
  electrico: debilidadesElectrico,
  hielo: debilidadesHielo,
  siniestro: debilidadesSiniestro,
  lucha: debilidadesLucha,
  veneno: debilidadesVeneno,
  roca: debilidadesRoca,
  fantasma: debilidadesFantasma,
  fuego: debilidadesFuego,
  planta: debilidadesPlanta,
  psiquico: debilidadesPsiquico,
  dragon: debilidadesDragon,
  hada: debilidadesHada
};

// ======= Permitir soltar =======
function permitirSoltar(event) {
  event.preventDefault();
}

// =======Iniciar arrastre =======
function arrastrar(event) {
  event.dataTransfer.setData("text", event.target.id);
}

// ======= Soltar ficha en celda =======
function soltar(event) {
  event.preventDefault();
  let data = event.dataTransfer.getData("text");
  let elementoArrastrado = document.getElementById(data);
  let celdaObjetivo = event.target.closest('td'); 

  // Verifica que la celda está libre y el turno es correcto
  if (celdaObjetivo && !celdaObjetivo.classList.contains('ocupadaRoja') && !celdaObjetivo.classList.contains('ocupadaAzul')) {
    if ((turno % 2 === 0 && elementoArrastrado.classList.contains('blue')) || (turno % 2 !== 0 && elementoArrastrado.classList.contains('red'))) {
      celdaObjetivo.appendChild(elementoArrastrado);
      primeraClaseUltimaFicha = elementoArrastrado.classList[0];
      segundaClaseUltimaFicha = elementoArrastrado.classList[1];
      elementoArrastrado.classList.add("bloqueado");
      turno++;
      if (elementoArrastrado.id == ("fuegoRojo")) {
        continuarTutorial();
      }
      if (elementoArrastrado.id == ("tierraRojo") || elementoArrastrado.id == ("aguaRojo") || elementoArrastrado.id == ("rocaRojo")) {
        continuarTutorial2();
      }
      // Marca la celda como ocupada por el color correspondiente
      if (elementoArrastrado.classList.contains('blue')) {
        celdaObjetivo.classList.add('ocupadaAzul');
        azules++;
        celdaObjetivo.style.backgroundColor = "rgb(177, 209, 228)";
      } else if (elementoArrastrado.classList.contains('red')) {
        celdaObjetivo.classList.add('ocupadaRoja');
        rojas++;
        celdaObjetivo.style.backgroundColor = "rgb(228, 177, 187)";
      }
      actualizarMensajeTurno();
      actualizarNumeroTurno();
      actualizarContadoresFichas();
    }
  }
}

// ======= Buscar número de celda y comprobar adyacentes =======
function buscarNumero(event) {
  const celda = event.target.closest('td');
  if (celda && celda.tagName.toLowerCase() === 'td' && celda.querySelector('img')) {
    imprimirCeldaAdyacenteConImagen(celda, 'izquierda');
    imprimirCeldaAdyacenteConImagen(celda, 'derecha');
    imprimirCeldaAdyacenteConImagen(celda, 'arriba');
    imprimirCeldaAdyacenteConImagen(celda, 'abajo');
  }
  // Deshabilita el arrastre tras colocar la ficha
  event.target.setAttribute("draggable", "false");
}

// ======= Comprueba si hay fichas adyacentes y verifica interacciones =======
function imprimirCeldaAdyacenteConImagen(celda, direccion) {
  let celdaAdyacente = obtenerCeldaAdyacente(celda, direccion);
  let clase = segundaClaseUltimaFicha;
  if (celdaAdyacente && celdaAdyacente.querySelector('img')) {
    let celdaAdyacenteConFicha = document.getElementById(celdaAdyacente.id);
    let fichaAdyacente = celdaAdyacenteConFicha.querySelector('img');
    verificarInteraccion(clase, fichaAdyacente, celdaAdyacenteConFicha);
  }
}

// ======= Obtiene la celda adyacente en la dirección indicada =======
function obtenerCeldaAdyacente(celda, direccion) {
  let indiceCelda = celda.cellIndex;
  let fila = celda.parentNode;
  let indiceFila = fila.rowIndex;
  let tabla = fila.parentNode;
  switch (direccion) {
    case 'izquierda':
      return indiceCelda > 0 ? tabla.rows[indiceFila].cells[indiceCelda - 1] : null;
    case 'derecha':
      return indiceCelda < fila.cells.length - 1 ? tabla.rows[indiceFila].cells[indiceCelda + 1] : null;
    case 'arriba':
      return indiceFila > 0 ? tabla.rows[indiceFila - 1].cells[indiceCelda] : null;
    case 'abajo':
      return indiceFila < tabla.rows.length - 1 ? tabla.rows[indiceFila + 1].cells[indiceCelda] : null;
    default:
      return null;
  }
}

// ======= Actualiza el mensaje de turno =======
function actualizarMensajeTurno() {
  let mensajeElemento = document.getElementById('turnoMensaje');
  mensajeElemento.textContent = turno % 2 === 0 ? "Es el turno del azul" : "Es el turno del rojo";
}

// ======= Actualiza el número de turno =======
function actualizarNumeroTurno() {
  let numeroTurnoElemento = document.getElementById('numeroTurno');
  numeroTurnoElemento.textContent = "Turno: " + Math.ceil(turno / 2);
}

// ======= Actualiza los contadores de fichas =======
function actualizarContadoresFichas() {
  document.getElementById('fichasRojas').textContent = 'Fichas Rojas: ' + rojas;
  document.getElementById('fichasAzules').textContent = 'Fichas Azules: ' + azules;
}

// ======= Verifica si hay interacción (captura) por debilidad =======
function verificarInteraccion(elementoColocado, elementoAdyacente, celda) {
  let claseAdyacente = elementoAdyacente.classList[1];
  if (debilidades[claseAdyacente] && debilidades[claseAdyacente].includes(elementoColocado) && primeraClaseUltimaFicha != elementoAdyacente.classList[0]) {
    darVuelta(elementoAdyacente, celda);
  }
}

// ======= Da la vuelta (cambia de color) a la ficha capturada =======
function darVuelta(elementoAdyacente, celda) {
  if (elementoAdyacente.classList.contains("red")) {
    elementoAdyacente.classList.remove("red");
    let clases = elementoAdyacente.className.split(' ');
    clases.unshift('blue');
    elementoAdyacente.className = clases.join(' ');
    celda.style.backgroundColor = " rgb(177, 209, 228)";
    azules++;
    rojas--;
    actualizarContadoresFichas();
  } else {
    elementoAdyacente.classList.remove("blue");
    let clases = elementoAdyacente.className.split(' ');
    clases.unshift('red');
    elementoAdyacente.className = clases.join(' ');
    celda.style.backgroundColor = " rgb(228, 177, 187)";
    rojas++;
    azules--;
    actualizarContadoresFichas();
  }
}

// ======= Gestión de pop-up informativo =======
const toggleButton = document.getElementById('toggleButton');
const imagenPopup = document.getElementById('imagenPopup');
const cruzButton = imagenPopup.querySelector('.cruz');
toggleButton.addEventListener('click', () => {
  if (imagenPopup.style.display === 'none' || imagenPopup.style.display === '') {
    imagenPopup.style.display = 'block';
  } else {
    imagenPopup.style.display = 'none';
  }
});
cruzButton.addEventListener('click', () => {
  imagenPopup.style.display = 'none';
});

// ======= Animación para mover la imagen de una ficha =======
function moverImagen() {
  const rect = destino.getBoundingClientRect();
  const destinoX = rect.left + window.scrollX;
  const destinoY = rect.top + window.scrollY;
  const rectImagen = imagen.getBoundingClientRect();
  let posX = rectImagen.left + window.scrollX;
  let posY = rectImagen.top + window.scrollY;
  const velocidad = 9;
  const distanciaX = destinoX - posX;
  const distanciaY = destinoY - posY;
  const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
  if (distancia > velocidad) {
    const proporcionX = distanciaX / distancia;
    const proporcionY = distanciaY / distancia;
    posX += velocidad * proporcionX;
    posY += velocidad * proporcionY;
    imagen.style.position = 'absolute';
    imagen.style.left = posX + 'px';
    imagen.style.top = posY + 'px';
    requestAnimationFrame(moverImagen);
  } else {
    destino.appendChild(imagen);
    imagen.style.position = 'static';
    imagen.style.left = '';
    imagen.style.top = '';
    destino.style.backgroundColor = "rgb(177, 209, 228)";
  }
}

moverImagen();
