const app = require('express')();
const fs = require('fs');
const https = require('https').createServer({
    key: fs.readFileSync('./SSL/key.pem'),
    cert: fs.readFileSync('./SSL/cert.pem')
}, app);
const io = require('socket.io')(https);
const port = 3002;
const conexion = require('../API/util/bdConnection');
const modelos = require('../API/util/requireAllModels')(conexion);
const { writeError } = require('./utils/funciones');

let usuariosConectados = [];
let usuariosLogueados = [];

io.on('connection', (socket) => {
    registrarConexion(socket, 'IN');

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
        registrarConexion(socket, 'OUT');
        usuariosConectados = usuariosConectados.filter(item => item.socketId !== socket.id);
        usuariosLogueados = usuariosLogueados.filter(item => item.socketId !== socket.id);
        printDataOnConsole();
    });

    socket.on('kickBanned', async ({ idPerfil, banDays }) => {
        writeError({ idPerfil, banDays });
        const modeloUsuario = modelos.usuario;
        const foundUser = await modeloUsuario.findOne({
          idPerfil
        });

        if (foundUser !== null) {
          const kickUser = usuariosLogueados.find((ul) => ul.idUsuario === foundUser._id.toString());
          if (kickUser !== undefined) {
            io.to(`${kickUser.socketId}`).emit('banned', banDays);
          }
        }
    })
})

https.listen(port, () => {
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

const registrarConexion = async (socket, inOut) => {
    const modeloConexion = modelos.conexion;
    const conexion = new modeloConexion({
        fechaConexion: Date.now(),
        inOut,
        socketId: socket.id,
        ip: socket.conn.remoteAddress
    });
    conexion.save();
}