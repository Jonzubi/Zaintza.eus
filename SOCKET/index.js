const app = require("express")();
const cors = require("cors");
// Configuracion del CORS
app.use(cors({ origin: 'https://www.zaintza.eus',credentials: true }));
const fs = require("fs");
const https = require("https");
const http = require("http").createServer(app);
const socketIO = require("socket.io");
const port = 3002;
const conexion = require("../API/util/bdConnection");
const modelos = require("../API/util/requireAllModels")(conexion);
const { writeError } = require("./utils/funciones");

let usuariosConectados = [];
let usuariosLogueados = [];

let launchedServer;
let launchedServerType;

if (process.env.NODE_ENV.includes("production")) {
  launchedServer = https
    .createServer(
      {
        key: fs.readFileSync(
          "/etc/letsencrypt/live/www.zaintza.eus/privkey.pem"
        ),
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/www.zaintza.eus/fullchain.pem"
        ),
      },
      app
    )
    launchedServerType = 'HTTPS';
} else {
  launchedServer = http;
  launchedServerType = 'HTTP';
}

const io = socketIO(launchedServer, {
  origin: true,
  credentials: true
});

io.on("connection", (socket) => {
  let deviceData = JSON.parse(socket.handshake.query.deviceData);
  registrarConexion(socket, deviceData, "IN");

  usuariosConectados.push({
    socketId: socket.id,
  });
  printDataOnConsole();

  socket.on("login", (loggedData) => {
    registrarLogin(socket.id, loggedData.idUsuario, "IN");
    usuariosLogueados.push(Object.assign({ socketId: socket.id }, loggedData));
    io.to(`${socket.id}`).emit("notifyReceived");
    printDataOnConsole();
  });

  socket.on("logout", ({ idUsuario }) => {
    registrarLogin(socket.id, idUsuario, "OUT");
    usuariosLogueados = usuariosLogueados.filter(
      (item) => item.idUsuario !== idUsuario
    );
    printDataOnConsole();
  });

  socket.on("notify", ({ idUsuario }) => {
    const usertToNotify = usuariosLogueados.filter(
      (item) => item.idUsuario === idUsuario.toString()
    )[0];
    if (usertToNotify !== undefined) {
      io.to(`${usertToNotify.socketId}`).emit("notifyReceived");
    } else {
      console.log(
        "[Evento Notify] Destinatario no encontrado\nIdUsuarioMandado:" +
          idUsuario
      );
    }
  });

  socket.on("disconnect", () => {
    registrarConexion(socket, deviceData, "OUT");
    usuariosConectados = usuariosConectados.filter(
      (item) => item.socketId !== socket.id
    );
    usuariosLogueados = usuariosLogueados.filter(
      (item) => item.socketId !== socket.id
    );
    printDataOnConsole();
  });

  socket.on("kickBanned", async ({ idPerfil, banDays }) => {
    writeError({ idPerfil, banDays });
    const modeloUsuario = modelos.usuario;
    const foundUser = await modeloUsuario.findOne({
      idPerfil,
    });

    if (foundUser !== null) {
      const kickUser = usuariosLogueados.find(
        (ul) => ul.idUsuario === foundUser._id.toString()
      );
      if (kickUser !== undefined) {
        io.to(`${kickUser.socketId}`).emit("banned", banDays);
      }
    }
  });
});

launchedServer.listen(port, () => {
  console.log(`[SOCKET - ${launchedServerType}] Escuchando el puerto: ${port}`);
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
};

const registrarConexion = async (socket, deviceData, inOut) => {
  const modeloConexion = modelos.conexion;
  const conexion = new modeloConexion({
    fechaConexion: Date.now(),
    inOut,
    socketId: socket.id,
    ip: socket.conn.remoteAddress,
    device: deviceData,
  });
  conexion.save();
};

const registrarLogin = async (socketId, idUsuario, inOut) => {
  const modeloLogin = modelos.login;
  const login = new modeloLogin({
    idUsuario,
    socketId,
    fechaLogin: Date.now(),
    inOut,
  });
  login.save();
};
