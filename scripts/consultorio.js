const contenedorProximosTurnos = document.querySelector('.contenedor-turnos');
const contenedorTurnoDetallado = document.querySelector('.contenedor-turno-detallado');
const btnChat = document.querySelector('.btn-chat');
const contenedorChat = document.querySelector('.toast-container');
let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const nombreProfesional = document.querySelector('.nombre');
var hayAnuncio = false;

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

// Creo la referencia al "nodo" chat
var referenciaChat = database.ref(stringFecha + '/chat');
referenciaChat.orderByChild("receptor").equalTo("Consultorio 112:").on('value', gotChat, errData);

var refAnuncio = database.ref(stringFecha + '/anuncio');
refAnuncio.on('value', gotAnuncio, errData);

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
            <h3 class="numero-turno">${turno}</h3>
        </div>
        <div class="contenedor-num-turno">
            <h3 class="horario">${horaInicio} - ${horaFin}</h3>
        </div>
        `

        // Aqui insertamos al DOM el turno creado en contenedorProximosTurnos
        contenedorProximosTurnos.appendChild(nuevoTurno)

        // Aqui llego y le pongo el event listener a los turnos-proximos
        nuevoTurno.addEventListener('click', () => {
            console.log(hayAnuncio);
            if (hayAnuncio == false) {
                console.log(nuevoTurno.children[0].innerText);
                firebase.database().ref(stringFecha + '/anuncio').push({
                    consultorio: "112",
                    turno: nuevoTurno.children[0].innerText
                })
                if (contenedorTurnoDetallado.innerHTML === '') {
                    // Creo la referencia a la base de datos del turno que clickearon
                    var referenciaTurno = database.ref(stringFecha + '/proximos-turnos/' + nuevoTurno.id);
                    referenciaTurno.on('value', activarTurno, errData);
                    referenciaProximosTurnos.child(nuevoTurno.id).remove();
                } else {
                    createPopupYahay(); 
                }
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
        <div class="barra-abajo"></div>
        <div class="barra-tempo"></div>
        `

        contenedorTurnoDetallado.appendChild(contenedorDoble);

        const botonLlamar = document.querySelector('.btn-llamar');
        botonLlamar.addEventListener('click', () => {
            if (hayAnuncio == false) {
                firebase.database().ref(stringFecha + '/anuncio').push({
                    consultorio: consultorio,
                    turno: turno
                })
            }
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

function gotChat(data) {

    limpiarChat();

    var mensajes = data.val();
    var keys = Object.keys(mensajes);

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var consultorio = mensajes[k].remitente;
        var mensaje = mensajes[k].mensaje;
        
        const chat = document.createElement('div');
        chat.classList.add('toast');
        chat.setAttribute("id", k);
        chat.innerHTML = `
        <h3 class="remitente">${consultorio}:</h3>
        <h5 class="mensaje">${mensaje}</h5>
        <div class="botones-mensaje">
            <button class="cerrar-mensaje">Cerrar</button>
            <button class="replicar">Responder</button>
        </div>
        `

        contenedorChat.appendChild(chat);

        const btnCerrar = document.querySelectorAll('.cerrar-mensaje');
        const btnResponder = document.querySelectorAll('.replicar');

        for (let i = 0; i < btnCerrar.length; i++) {
            btnCerrar[i].addEventListener('click', () => {
                referenciaChat.child(btnCerrar[i].parentElement.parentElement.id).remove(); 
                btnCerrar[i].parentElement.parentElement.remove();
            })  
        }

        for (let i = 0; i < btnResponder.length; i++) {
            btnResponder[i].addEventListener('click', () => {
                btnResponder[i].parentElement.parentElement.remove();
                referenciaChat.child(btnResponder[i].parentElement.parentElement.id).remove();
                const popup = document.createElement('div');
                popup.classList.add('popup-enviar-mensaje');

                popup.innerHTML = `
                <h2>Nuevo mensaje:</h2>
                <textarea class="mensaje"></textarea>
                <div class="botones-enviar-mensaje">
                    <button class="cancelar-mensaje">Cancelar</button>
                    <button class="enviar-mensaje">Enviar</button>
                </div>
                `

                document.body.appendChild(popup);

                const btnCancelar = document.querySelector('.cancelar-mensaje');
                const btnEnviar = document.querySelector('.enviar-mensaje');
                const mensaje = document.querySelector('.mensaje');

                btnEnviar.addEventListener('click', () => {
                    firebase.database().ref(stringFecha + '/chat').push({
                        remitente: "Consultorio 112",
                        receptor: "recepcion",
                        mensaje: mensaje.value
                    });
                    btnEnviar.parentElement.parentElement.remove();
                })

                btnCancelar.addEventListener('click', () => {
                    btnCancelar.parentElement.parentElement.remove();
                })
            })
            
        }

    }
}

function gotAnuncio(data) {
    var anuncio = data.val();
    var keys = Object.keys(anuncio);

    if (keys.length > 0) {
        hayAnuncio = true;
        const botonLlamar = document.querySelector('.btn-llamar');
        botonLlamar.classList.add("rojo");
        setTimeout(falsetearAnuncio, 6000);
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

function limpiarChat() {
    contenedorChat.innerHTML = ''
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

btnChat.addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.classList.add('popup-enviar-mensaje');

    popup.innerHTML = `
    <h2>Nuevo mensaje a recepcion:</h2>
    <textarea class="mensaje"></textarea>
    <div class="botones-enviar-mensaje">
        <button class="cancelar-mensaje">Cancelar</button>
        <button class="enviar-mensaje">Enviar</button>
    </div>
    `

    document.body.appendChild(popup);

    const btnEnviar = document.querySelector('.enviar-mensaje');
    const btnCancelar = document.querySelector('.cancelar-mensaje');
    const mensaje = document.querySelector('.mensaje');

    btnEnviar.addEventListener('click', () => {
        firebase.database().ref(stringFecha + '/chat').push({
            remitente: "Consultorio 112",
            receptor: "recepcion",
            mensaje: mensaje.value
        });
        btnEnviar.parentElement.parentElement.remove();
    })

    btnCancelar.addEventListener('click', () => {
        btnCancelar.parentElement.parentElement.remove();
    })
})

function falsetearAnuncio() {
    hayAnuncio = false;
    const botonLlamar = document.querySelector('.btn-llamar');
    botonLlamar.classList.remove("rojo");
}