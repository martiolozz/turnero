const contenedorTotal = document.querySelector('.contenedor-total');
const btnAsignarConsultorio = document.querySelector('.btn-asignar-consultorio');
const btnNuevoPaciente = document.querySelector('.btn-nuevo-paciente');
const contenedorConsultorios = document.querySelector('.contenedor-consultorios');
const contenedorProximosTurnos = document.querySelector('.contenedor-proximos-turnos');
const contenedorTurnosActivos = document.querySelector('.contenedor-turnos-activos');
const inputNombre = document.getElementById('input-nombre');
const textoFecha = document.querySelector('.texto-fecha');
const textoHora = document.querySelector('.texto-hora');
const contenedorChat = document.querySelector('.toast-container');
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

setInterval(ponerLaFecha, 1000);

function ponerLaFecha() {
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getUTCMonth() + 1;
    const year = fecha.getFullYear();
    const hora = fecha.getHours();
    const horaLegible = hora % 12
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();
    textoFecha.innerHTML = `${dia} ${meses[mes - 1]} ${year}`;
    textoHora.innerHTML =  `${horaLegible < 1 ? `12` : horaLegible}:${minutos < 10 ? `0${minutos}` : minutos}:${segundos < 10 ? `0${segundos}` : segundos}`;
}

// Initializo Firebase
firebase.initializeApp(firebaseConfig);

// Creo la referencia a la base de datos como tal
database = firebase.database();

const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.getUTCMonth() + 1;
const year = fecha.getFullYear();  
const stringFecha = `${dia} ${meses[mes - 1]} ${year}`;
// Creo la referencia al "nodo" consultorios en la base de datos
var refConsultorios = database.ref(stringFecha + '/consultorios');
refConsultorios.on('value', gotConsultorios, errData);

// Creo la referencia al "nodo" proximos-turnos
var referenciaProximosTurnos = database.ref(stringFecha + '/proximos-turnos');
referenciaProximosTurnos.on('value', gotProximos, errData);

// Creo la referencia al "nodo" proximos-turnos
var referenciaTurnosActivos = database.ref(stringFecha + '/turnos-activos');
referenciaTurnosActivos.on('value', gotActivos, errData);

// Creo la referencia al "nodo" chat
var referenciaChat = database.ref(stringFecha + '/chat');
referenciaChat.orderByChild("receptor").equalTo("recepcion").on('value', gotChat, errData);

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
        var consultorio = turnos[k].consultorio;

        const nuevoTurno = document.createElement('div')
        nuevoTurno.classList.add('proximo-turno')
        nuevoTurno.setAttribute("id", k)
        nuevoTurno.innerHTML = `
        <div class="contenedor-num-consultorio">
            <h3 class="numero-consultorio">C-${consultorio}</h3>
        </div>
        <div class="contenedor-num-turno">
            <h3 class="numero-turno">T-${turno}</h3>
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

// Creamos la funcion para limpiar el innerHTML de contenedorProximosTurnos
function borrarAnterioresProximosTurnos() {
    contenedorProximosTurnos.innerHTML = ''
}

// Creamos la funcion para pasarle a la referencia refConsultorios de firebase
function gotConsultorios(data) {
    borrarAnterioresConsultorios();
    var consultorios = data.val();
    var keys = Object.keys(consultorios);

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var consultorio = consultorios[k].consultorio;
        var profesional = consultorios[k].profesional;
        var profesion = consultorios[k].profesion;
        var horaEntrada = consultorios[k].horaEntrada;
        var horaSalida = consultorios[k].horaSalida;

        const nuevoConsultorio = document.createElement('div')
        nuevoConsultorio.classList.add('contenedor-consultorio')
        nuevoConsultorio.setAttribute("id", k)
        nuevoConsultorio.innerHTML = `
        <h2 class="numero-consultorio-grande">${consultorio}</h2>
        <h4 class="nombre-profesional">Dr. ${profesional}</h3>
        <h4 class="profesion">${profesion}</h3>
        <h4 class="horario">${horaEntrada} - ${horaSalida}</h3>
        `

        contenedorConsultorios.appendChild(nuevoConsultorio);

        nuevoConsultorio.addEventListener('click', () => {
            createPopUpNuevo();
    
            // Aqui traigo todos los elementos con los que voy a trabajar
            const btnAceptar = document.getElementById('aceptar');
            const btnCancelar = document.getElementById('cancelar');
            const inputNombre = document.getElementById('input-nombre');
            const inputTurno = document.getElementById('input-turno');
            const inputEntrada = document.getElementById('input-entrada');
            const inputSalida = document.getElementById('input-salida');
    
            // EventListener del boton aceptar crear usuario
            btnAceptar.addEventListener('click', () => {
                // Creo la referencia a 'proximos-turnos' en firebase y le pusheo el nuevo turno
                // el cual queda con un UID como padre de el nodo
                firebase.database().ref(stringFecha + '/proximos-turnos').push({
                        paciente: inputNombre.value,
                        turno: inputTurno.value,
                        consultorio: nuevoConsultorio.children[0].innerHTML,
                        horaInicio: inputEntrada.value,
                        horaFin: inputSalida.value 
                });
                // elimino el popup para crear turno del DOM
                btnAceptar.parentElement.parentElement.parentElement.remove();
            })  
        
            // EventListener del boton cancelar crear turno
            btnCancelar.addEventListener('click', () => {
                // Remuevo el popup para crear turno
                btnCancelar.parentElement.parentElement.parentElement.remove();
            })
        })

        nuevoConsultorio.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            refConsultorios.child(nuevoConsultorio.id).remove();
        })
    }
}

function gotActivos(data) {
    borrarAnterioresTurnosActivos();
    var turnos = data.val();
    var keys = Object.keys(turnos);

    for (let i = 0; i < keys.length; i++) {
        var k = keys[i];
        var turno = turnos[k].turno;
        var consultorio = turnos[k].consultorio;

        const turnoActivo = document.createElement('div')
        turnoActivo.classList.add('proximo-turno')
        turnoActivo.innerHTML = `
        <div class="contenedor-num-consultorio">
            <h3 class="numero-consultorio">C-${consultorio}</h3>
        </div>
        <div class="contenedor-num-turno">
            <h3 class="numero-turno">T-${turno}</h3>
        </div>
        `  
        
        contenedorTurnosActivos.appendChild(turnoActivo);
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
                var receptor = (btnResponder[i].parentElement.parentElement.children[0].innerHTML);
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
                        remitente: "recepcion",
                        receptor: receptor,
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

// La funcion para si algo pasa en las referecias a firebase
function errData(err) {
    console.log('Error!');
    console.log(err);
}

// Funcion para limpiarle el innerHTML al contenedorConsultorios
function borrarAnterioresConsultorios() {
    contenedorConsultorios.innerHTML = ''
}

function borrarAnterioresTurnosActivos() {
    contenedorTurnosActivos.innerHTML = ''
}

function limpiarChat() {
    contenedorChat.innerHTML = ''
}

// Event listener del boton asignar consultorio
btnAsignarConsultorio.addEventListener('click', () => {
    // Llamamos a la funcion para crear el popup de asignar un consultorio
    createPopUpAsignar();
    
    // Traigo todos los elemntos de el DOM que necesito
    const btnAceptar = document.getElementById('aceptar');
    const btnCancelar = document.getElementById('cancelar');
    const inputProfesional = document.getElementById('input-profesional');
    const inputProfesion = document.getElementById('input-profesion');
    const inputConsultorio = document.getElementById('input-consultorio');
    const inputEntrada = document.getElementById('input-entrada');
    const inputSalida = document.getElementById('input-salida');

    // EventListener del boton para aceptar asignar un consultorio
    btnAceptar.addEventListener('click', () => {
        firebase.database().ref(stringFecha + '/consultorios/').push({
            profesional: inputProfesional.value,
            profesion: inputProfesion.value,
            consultorio: inputConsultorio.value,
            horaEntrada: inputEntrada.value,
            horaSalida: inputSalida.value
        });
        // Yo la verdad no se si sea lo mas viable hacer esto, pero aqui 
        // borramos el popup que acabamos de crear para asignar un consultorio
        btnAceptar.parentElement.parentElement.parentElement.remove()
    })

    // EventListener del boton para cancelar asignar un consultorio
    btnCancelar.addEventListener('click', () => {
        btnCancelar.parentElement.parentElement.parentElement.remove()
    })
})

btnNuevoPaciente.addEventListener('click', () => {
    createPopupTexto();

    const btnAceptar = document.querySelector('.btn-aceptar-texto');
    const btnCancelar = document.querySelector('.btn-cancelar-texto');
    const textArea = document.querySelector('.input-texto-info');


    btnCancelar.addEventListener('click', () => {
        btnCancelar.parentElement.parentElement.remove();
    })

    btnAceptar.addEventListener('click', () => {
        if (textArea.value != '') {  
            firebase.database().ref(stringFecha + '/texto-informativo').set({
                texto: textArea.value
            })
        }
        btnAceptar.parentElement.parentElement.remove();
    })
})

// Esta es la funcion para crear el poppup de crear un nuevo paciente
function createPopUpNuevo() {
    const popup = document.createElement('div')
    popup.classList.add('container-popup-nuevo')

    popup.innerHTML = `
    <h1>Nuevo Paciente</h1>
    <div class="settings">
        <div class="setting-nombre">
            <label>Nombre:</label>
            <input type="text" id="input-nombre" class="input-nombre">
        </div>
        <div class="contenedor-turno-consultorio">
            <div class="setting">
                <label>Turno:</label>
                <input type="number" id="input-turno" min="1" max="1000" value="999">
            </div>
        </div>
        <div class="contenedor-turno-consultorio">
            <div class="setting">
                <label>Entrada:</label>
                <input type="time" id="input-entrada" min="06:00" max="19:00" value="08:00">
            </div>
            <div class="setting">
                <label>Salida:</label>
                <input type="time" id="input-salida" min="06:00" max="19:00" value="08:00">
            </div>
        </div>
        <div class="contenedor-botones">
            <button class="btn btn-large" id="cancelar">Cancelar</button>
            <button class="btn btn-large" id="aceptar">Aceptar</button>
        </div>
    </div>
    `
    contenedorTotal.appendChild(popup)
}

// Esta es la funcion para crear el popup de asignar un consultorio en el DOM
function createPopUpAsignar() {
    const popup = document.createElement('div')
    popup.classList.add('container-popup-asignar')

    popup.innerHTML = `
    <h1>Asignar Consultorio</h1>
    <div class="settings">
        <div class="setting-nombre">
            <label>Profesional:</label>
            <input type="text" id="input-profesional" class="input-profesional">
        </div>
        <div class="setting-nombre">
            <label>Profesion:</label>
            <input type="text" id="input-profesion" class="input-profesion">
        </div>
        <div class="contenedor-turno-consultorio">
            <div class="setting">
                <label>Consultorio:</label>
                <input type="number" id="input-consultorio" class="input-consultorio" min="1" max="1000" value="999">
            </div>
            <div class="setting">
                <label>Entrada:</label>
                <input type="time" id="input-entrada" min="06:00" max="19:00" value="08:00">
            </div>
            <div class="setting">
                <label>Salida:</label>
                <input type="time" id="input-salida" min="06:00" max="19:00" value="08:00">
            </div>
        </div>
        <div class="contenedor-botones">
            <button class="btn btn-large" id="cancelar">Cancelar</button>
            <button class="btn btn-large" id="aceptar">Aceptar</button>
        </div>
    </div>
    `
    contenedorTotal.appendChild(popup)
}

function createPopupTexto() {
    const popup = document.createElement('div');
    popup.classList.add('popup-fijar-texto');


    popup.innerHTML= `
    <h2>Fijar el texto de la sala de espera</h2>
        <textarea type="text" class="input-texto-info"></textarea>
        <div class="contenedor-botones-texto">
            <button class="btn-cancelar-texto">Cancelar</button>
            <button class="btn-aceptar-texto">Aceptar</button>
        </div>
    `
    contenedorTotal.appendChild(popup);
}