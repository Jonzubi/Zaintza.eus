const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3002;

io.on('connection', () => {
    console.log("Socket funcionando");
})

http.listen(port, () => {
    console.log(`[SOCKET] Escuchando el puerto: ${port}`);
});