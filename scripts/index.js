const textoDelMensaje = document.querySelector('.mensaje');
const botonSpeech = document.querySelector('.boton-speech');
const turnosActivos = document.querySelector('.turnos-activos');
const proximosTurnos = document.querySelector('.contenedor-proximos-turnos');
const mensajeInformativo = document.querySelector('.mensaje');
let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const textoHora = document.querySelector('.texto-hora');

var firebaseConfig = {
    apiKey: "AIzaSyASln_15XoqvOwSbCArUvhbe7laec_1r-Y",
    authDomain: "turnero-82163.firebaseapp.com",
    projectId: "turnero-82163",
    storageBucket: "turnero-82163.appspot.com",
    messagingSenderId: "1031203124717",
    appId: "1:1031203124717:web:cdd44535598372cea0e3e4",
    measurementId: "G-TSRHSKTCTF"
    };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

setInterval(ponerLaHora, 1000);

function ponerLaHora() {
    const fecha = new Date();
    const hora = fecha.getHours();
    const horaLegible = hora % 12
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();
    textoHora.innerHTML =  `${horaLegible < 1 ? `12` : horaLegible}:${minutos < 10 ? `0${minutos}` : minutos}:${segundos < 10 ? `0${segundos}` : segundos}`;
}

const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.getUTCMonth() + 1;
const year = fecha.getFullYear();  
const stringFecha = `${dia} ${meses[mes - 1]} ${year}`;

database = firebase.database();
var referenciaProximosTurnos = database.ref(stringFecha + '/proximos-turnos');
referenciaProximosTurnos.on('value', gotData, errData);

var referenciaTurnosActivos = database.ref(stringFecha + '/turnos-activos');
referenciaTurnosActivos.on('value', gotActivos, errData);

var refMensaje = database.ref(stringFecha + '/texto-informativo');
refMensaje.on('value', gotMensaje, errData);

var refAnuncio = database.ref(stringFecha + '/anuncio');
refAnuncio.on('value', gotAnuncio, errData);

function gotData(data) {
    borrarAnterioresProximosTurnos();
    var turnos = data.val();
    var keys = Object.keys(turnos);

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var turno = turnos[k].turno;
        var consultorio = turnos[k].consultorio;

        const nuevoTurno = document.createElement('div')
        nuevoTurno.classList.add('proximo-turno')
        nuevoTurno.innerHTML = `
        <div class="contenedor-num-consultorio">
            <h3 class="numero-consultorio">C-${consultorio}</h3>
        </div>
        <div class="contenedor-num-turno">
            <h3 class="numero-turno">${turno}</h3>
        </div>
        `

        proximosTurnos.appendChild(nuevoTurno);
    }
}

function gotActivos(data) {
    borrarAnterioresTurnosActivos();
    var turnos = data.val();
    var keys = Object.keys(turnos);
    keys = keys.reverse();

    var audio = new Audio('../audio/mensaje.mp3');
    audio.play();

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var turno = turnos[k].turno;
        var consultorio = turnos[k].consultorio;

        const turnoActivo = document.createElement('div');
        turnoActivo.classList.add('turno')
        turnoActivo.innerHTML = `
        <div class="contenedor-num-consultorio">
            <h3 class="numero-consultorio">C-${consultorio}</h3>
        </div>
        <div class="contenedor-num-turno">
            <h3 class="numero-turno">${turno}</h3>
        </div>
        `
        
        turnosActivos.appendChild(turnoActivo);
    }
}

function gotMensaje(data) {
    var mensaje = data.val();
    var texto = mensaje.texto;
    mensajeInformativo.innerText = texto;
}

function gotAnuncio(data) {
    var infoAnuncio = data.val();
    var keys = Object.keys(infoAnuncio);

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var turno = infoAnuncio[k].turno;
        var consultorio = infoAnuncio[k].consultorio;
        
        const anuncio = document.createElement('div');
        anuncio.classList.add('contenedor-anuncio');
        anuncio.setAttribute("id", k);
        anuncio.innerHTML = `
        <div class="big-ass-number">
            <h1 class="avergas">${turno}</h1>
        </div>
        `

        document.body.appendChild(anuncio);

        hablalesClaro(turno, consultorio);

        setTimeout(() => {
            limpiarAnuncio(k);
        }, 5000);
    }
}

function errData(err) {
    console.log('Error!');
    console.log(err);
}

function borrarAnterioresProximosTurnos() {
    proximosTurnos.innerHTML = ''
}

function borrarAnterioresTurnosActivos() {
    turnosActivos.innerHTML = `
    <div class="titulos-turnos-activos">
        <div class="contenedor-titulo-consultorio">
            <h3 class="numero-consultorio">Consultorio:</h3>
        </div>
        <div class="contenedor-titulo-turno">
            <h3 class="numero-turno">Turno:</h3>
        </div>
    </div>
    `
}

function hablalesClaro(turno, consultorio) {
    var msg = new SpeechSynthesisUtterance();
    msg.lang = 'es';
    msg.text = `El turno, ${turno} pasar al consultorio, ${consultorio}`;
    window.speechSynthesis.speak(msg);
}


function limpiarAnuncio(id) {
    refAnuncio.child(id).remove();
    var anuncio = document.getElementById(id);
    document.body.removeChild(anuncio);
}