const textoDelMensaje = document.querySelector('.mensaje');
const botonSpeech = document.querySelector('.boton-speech');
const turnosActivos = document.querySelector('.turnos-activos');
const proximosTurnos = document.querySelector('.contenedor-proximos-turnos');

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

botonSpeech.addEventListener("click", () => {
    var msg = new SpeechSynthesisUtterance();
    msg.lang = 'es';
    msg.text = textoDelMensaje.innerHTML;
    window.speechSynthesis.speak(msg);
})

database = firebase.database();
var ref = database.ref('proximos-turnos');
ref.on('value', gotData, errData);

function gotData(data) {
    borrarAnterioresProximosTurnos();
    var turnos = data.val();
    var keys = Object.keys(turnos);
    console.log(keys);

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
            <h3 class="numero-turno">T-${turno}</h3>
        </div>
        `

        proximosTurnos.appendChild(nuevoTurno)
    }
}

function errData(err) {
    console.log('Error!');
    console.log(err);
}

function borrarAnterioresProximosTurnos() {
    proximosTurnos.innerHTML = ''
}