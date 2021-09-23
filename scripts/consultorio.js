const contenedorProximosTurnos = document.querySelector('.contenedor-turnos');
const contenedorTurnoDetallado = document.querySelector('.contenedor-turno-detallado');
let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const nombreProfesional = document.querySelector('.nombre');

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

// Creo la referencia al "nodo" consultorios en la base de datos
var refConsultorios = database.ref(stringFecha + '/consultorios');
refConsultorios.orderByChild("consultorio").equalTo("112").on('value', gotProfesional, errData);

// Creo la referencia al "nodo" turnos-activos
var referenciaTurnoActivo = database.ref(stringFecha + '/turnos-activos');
referenciaTurnoActivo.orderByChild("consultorio").equalTo("112").on('value', gotActivo, errData);

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

        // Aqui llego y le pongo el event listener a los turnos-proximos
        nuevoTurno.addEventListener('click', () => {
            if (contenedorTurnoDetallado.innerHTML === '') {
                // Creo la referencia a la base de datos del turno que clickearon
                var referenciaTurno = database.ref(stringFecha + '/proximos-turnos/' + nuevoTurno.id);
                referenciaTurno.on('value', activarTurno, errData);
                referenciaProximosTurnos.child(nuevoTurno.id).remove(); 
            } else {
                createPopupYahay();
            }     
        })
    }  
}

function gotProfesional(data) {
    limpiarNombreProfesional();
    var consultorio = data.val();
    var keys = Object.keys(consultorio);

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var profesional = consultorio[k].profesional;
    }

    nombreProfesional.innerHTML = `Dr. ${profesional}`
}

function gotActivo(data) {
    limpiarTurnoActivo();

    var turnos = data.val();
    var keys = Object.keys(turnos);

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var nombre = turnos[k].paciente;
        var turno = turnos[k].turno;
        var horaInicio = turnos[k].horaInicio;
        var horaFin = turnos[k].horaFin;
        var consultorio = turnos[k].consultorio;
        
        const contenedorDoble = document.createElement('div');
        contenedorDoble.classList.add('contenedor-doble');
        contenedorDoble.setAttribute("id", k);
        contenedorDoble.innerHTML = `
        <div class="contenedor-botones">
            <button class="btn-llamar">
                <i class="fas fa-volume-up"></i>
            </button>
            <button class="btn-cerrar">
                <i class="far fa-times-circle"></i>
            </button>
        </div>
        <div class="contenedor-informacion-turno">
            <h2 class="titulo-mediano">Nombre: ${nombre}</h2>
            <h2 class="titulo-mediano">Turno: ${turno}</h2>
            <h2 class="titulo-mediano">Horario: ${horaInicio} - ${horaFin}</h2>
        </div>
        <div class="barra-tempo"></div>
        `

        contenedorTurnoDetallado.appendChild(contenedorDoble);

        const botonLlamar = document.querySelector('.btn-llamar');
        botonLlamar.addEventListener('click', () => {
            firebase.database().ref(stringFecha + '/anuncio').push({
                consultorio: consultorio,
                turno: turno
            })
        })

        const botonFinalizar = document.querySelector('.btn-cerrar');
        botonFinalizar.addEventListener('click', () => {
            createPopupFinalizar();

            const botonCerrar = document.querySelector('.btn-close');
            const botonAtendido = document.querySelector('.btn-realizado');
            const botonNollego = document.querySelector('.btn-nollego');

            botonCerrar.addEventListener('click', () => {
                botonCerrar.parentElement.remove();
            })

            botonAtendido.addEventListener('click', () => {
                firebase.database().ref(stringFecha + '/turnos-finalizados').push({
                    horaInicio: horaInicio,
                    horaFin: horaFin,
                    consultorio: consultorio,
                    estado: 'atendido',
                    paciente: nombre,
                    profesional: nombreProfesional.innerText
                })
                referenciaTurnoActivo.child(botonFinalizar.parentElement.parentElement.id).remove();
                botonCerrar.parentElement.remove();
            })

            botonNollego.addEventListener('click', () => {
                firebase.database().ref(stringFecha + '/turnos-finalizados').push({
                    horaInicio: horaInicio,
                    horaFin: horaFin,
                    consultorio: consultorio,
                    estado: 'No atendido',
                    paciente: nombre,
                    profesional: nombreProfesional.innerText
                })
                referenciaTurnoActivo.child(botonFinalizar.parentElement.parentElement.id).remove();
                botonCerrar.parentElement.remove();
            })
        })
    }
}

function activarTurno(data) {
    var turno = data.val();
    
    firebase.database().ref(stringFecha + '/turnos-activos').push({
        paciente: turno.paciente,
        turno: turno.turno,
        consultorio: turno.consultorio,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin
    });
}

function errData(err) {
    console.log('Error!');
    console.log(err);
}

function borrarAnterioresProximosTurnos() {
    contenedorProximosTurnos.innerHTML = '';
}

function limpiarTurnoActivo() {
    contenedorTurnoDetallado.innerHTML = '';
}

function createPopupFinalizar() {
    const popup = document.createElement('div')
    popup.classList.add('contenedor-popup-finalizar')

    popup.innerHTML = `
    <h2>Finalizar el turno</h2>
    <div class="contenedor-botones-finalizar">
        <button class="btn-nollego">
            <i class="fas fa-times"></i>
        </button>
        <button class="btn-realizado">
            <i class="fas fa-check"></i>
        </button>
    </div>
    <button class="btn-close">
        <i class="fas fa-times"></i>
    </button>
    <p class="explicacion">Marcar como atendido o no atendido</p>
    `

    document.body.appendChild(popup);
}

function createPopupYahay() {
    const popup = document.createElement('div');
    popup.classList.add('ups-popup');

    popup.innerHTML = `
    <div class="contenedor-equis">
        <i class="fas fa-times"></i>
    </div>
    <h2>Ups! Parece que ya tienes un turno activo</h2>
    `

    document.body.appendChild(popup);

    setTimeout(borrarPopup, 2000);
}

function borrarPopup() {
    var popup = document.querySelector('.ups-popup');
    popup.remove();
}

function limpiarNombreProfesional() {
    nombreProfesional.innerHTML = ''
}