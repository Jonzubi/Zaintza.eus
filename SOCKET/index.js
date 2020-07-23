const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3002;
const conexion = require('../API/util/bdConnection');
const modelos = require('../API/util/requireAllModels')(conexion);

let usuariosConectados = [];
let usuariosLogueados = [];

io.on('connection', (socket) => {

    usuariosConectados.push({
        socketId: socket.id
    });
    printDataOnConsole()

    socket.on('login', (loggedData) => {
        usuariosLogueados.push(Object.assign({socketId: socket.id}, loggedData));
        io.to(`${socket.id}`).emit('notifyReceived');
        printDataOnConsole()
    });

    socket.on('logout', ({ idUsuario }) => {
        usuariosLogueados = usuariosLogueados.filter(item => item.idUsuario !== idUsuario);
        printDataOnConsole();
    });

    socket.on('notify', ({ idUsuario }) => {
        const usertToNotify = usuariosLogueados.filter(item => item.idUsuario === idUsuario.toString())[0];
        if(usertToNotify !== undefined) {
            io.to(`${usertToNotify.socketId}`).emit('notifyReceived');
        } else {
            console.log("[Evento Notify] Destinatario no encontrado\nIdUsuarioMandado:" + idUsuario);
        }
    });

    socket.on('disconnect', () => {
        usuariosConectados = usuariosConectados.filter(item => item.socketId !== socket.id);
        usuariosLogueados = usuariosLogueados.filter(item => item.socketId !== socket.id);
        printDataOnConsole();
    });
})

http.listen(port, () => {
    console.log(`[SOCKET] Escuchando el puerto: ${port}`);
});

const printDataOnConsole = () => {
    console.clear();
    console.log("USUARIOS CONECTADOS");
    console.log("-------------------");
    console.log(usuariosConectados);
    console.log("\n\n");
    console.log("USUARIOS LOGUEADOS");
    console.log("-------------------");
    console.log(usuariosLogueados);
}