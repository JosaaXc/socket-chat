
const url = 'http://localhost:8080/api/auth/'
let usuario = null;
let socket = null;

//referencias HTML
const txtUid = document.querySelector('#txtUid')
const txtMensaje = document.querySelector('#txtmMensaje')
const ulUsuarios = document.querySelector('#ulUsuarios')
const ulMensajes = document.querySelector('#ulMensajes')
const btnSalir = document.querySelector('#btnSalir')

const validarJWT = async() =>{

    const token = localStorage.getItem( 'token' ) || ''

    if( token.length <= 10 ){
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch( url, {
        headers: { 'x-token': token }
    });
    
    const { usuario: userDB, token: tokenDB } = await resp.json()
    console.log( userDB, tokenDB )
    localStorage.setItem( 'token', tokenDB )
    usuario = userDB
    document.title = usuario.nombre

    await conectarSocket();
}

const conectarSocket = async() => {
    
    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Socket online')
    })

    socket.on('disconnect', () => {
        console.log("Desconectado")
    })


    socket.on('recibir-mensaje', mostrarMensajes )
    socket.on('usuarios-activos', mostrarUsuarios )

    socket.on('mensaje-privado', mensajePrivado )

}

const mensajePrivado = ( { de, mensaje } ) => {
    const mensajeHTML = `
        <p class="text-primary">Mensaje privado de ${ de }:</p>
        <p>${ mensaje }</p>
    `;
    // Agregar el mensaje privado al div de mensajes privados
    document.getElementById('divMensajesPrivados').innerHTML += mensajeHTML;
};
const mostrarUsuarios = ( usuarios = [] ) => {

    let userHTML = []
    usuarios.forEach( ({ nombre, uid }) => {

        userHTML += `
            <li>
                <p>
                    <h5 classs"text-success">${ nombre }</h5>
                    <span class="fs-6 text-muted">${ uid }</span>
                </p>
            </li>    
        `;
    });
    ulUsuarios.innerHTML = userHTML;

}
const mostrarMensajes = ( mensaje = [] ) => {

    let mensajeHTML = []
    mensaje.forEach( ({ mensaje, nombre ,uid }) => {

        mensajeHTML += `
            <li>
                <p>
                    <span class="text-primary">${ nombre }</span>
                    <span>${ mensaje }</span>
                </p>
            </li>    
        `;
    });
    ulMensajes.innerHTML = mensajeHTML;

}

txtMensaje.addEventListener('keyup', ({ keyCode })=> {

    const mensaje = txtMensaje.value
    const uid = txtUid.value
    if( keyCode !== 13 ) return
    if( mensaje.length === 0 ) return

    socket.emit('enviar-mensaje', { mensaje, uid } )
    txtMensaje.value = ''

})
const main = async() =>{

    //validar JWT
    await validarJWT()
}

btnSalir.onclick = () => {
    socket.disconnect();
    localStorage.clear()
    window.location = 'index.html'
}

main()
