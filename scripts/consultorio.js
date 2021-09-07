const contenedorProximosTurnos = document.querySelector('.contenedor-turnos');
let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Conexion con firebase
var firebaseConfig = {
    apiKey: "AIzaSyASln_15XoqvOwSbCArUvhbe7laec_1r-Y",
    authDomain: "turnero-82163.firebaseapp.com",
    projectId: "turnero-82163",
    storageBucket: "turnero-82163.appspot.com",
    messagingSenderId: "1031203124717",
    appId: "1:1031203124717:web:cdd44535598372cea0e3e4",
    measurementId: "G-TSRHSKTCTF"
};

// Initializo Firebase
firebase.initializeApp(firebaseConfig);

// Creo la referencia a la base de datos como tal
database = firebase.database();

const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.getUTCMonth() + 1;
const year = fecha.getFullYear();  
const stringFecha = `${dia} ${meses[mes - 1]} ${year}`;

// Creo la referencia al "nodo" proximos-turnos
var referenciaProximosTurnos = database.ref(stringFecha + '/proximos-turnos');
referenciaProximosTurnos.orderByChild("consultorio").equalTo("112").on('value', gotProximos, errData);

// Esta es la funcion para pasarle referenciaProximosTurnos
function gotProximos(data) {

    // Llamado a la funcion para limpiar el innerHTML elemento contenedor-proximos-turnos
    borrarAnterioresProximosTurnos();

    // Creamos la variable turnos y le asignamos el valor de la referencia a firebase
    var turnos = data.val();
    var keys = Object.keys(turnos);

    // Recorremos turnos 
    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var turno = turnos[k].turno;
        var horaInicio = turnos[k].horaInicio;
        var horaFin = turnos[k].horaFin;

        const nuevoTurno = document.createElement('div')
        nuevoTurno.classList.add('proximo-turno')
        nuevoTurno.setAttribute("id", k)
        nuevoTurno.innerHTML = `
        <div class="contenedor-num-consultorio">
            <h3 class="numero-turno">T-${turno}</h3>
        </div>
        <div class="contenedor-num-turno">
            <h3 class="horario">${horaInicio} - ${horaFin}</h3>
        </div>
        `

        // Aqui insertamos al DOM el turno creado en contenedorProximosTurnos
        contenedorProximosTurnos.appendChild(nuevoTurno)

        // Aqui si estamos llamando un EventListener en los proximos turnos para
        // borralos de la base de datos en firebase, pero esto se va 
        nuevoTurno.addEventListener('click', () => {
            referenciaProximosTurnos.child(nuevoTurno.id).remove();
        })
    }  

}

function errData(err) {
    console.log('Error!');
    console.log(err);
}

function borrarAnterioresProximosTurnos() {
    contenedorProximosTurnos.innerHTML = ''
}