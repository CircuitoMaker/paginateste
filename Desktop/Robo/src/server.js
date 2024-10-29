// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configura a pasta estática para servir o cliente HTML e JS
app.use(express.static("public"));

// Variável para armazenar pares de usuários conectados
const connectedUsers = {};

// Quando um cliente se conecta
io.on("connection", (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Armazena o usuário para identificar o par
    if (Object.keys(connectedUsers).length < 3) {
        connectedUsers[socket.id] = socket;
    } else {
        socket.emit("room_full", "A sala já está cheia.");
        socket.disconnect();
        return;
    }

    // Notifica o outro cliente para iniciar a conexão
    socket.broadcast.emit("new_peer", socket.id);

    // Roteia as mensagens de sinalização WebRTC
    socket.on("signal", (data) => {
        const targetSocket = connectedUsers[data.target];
        if (targetSocket) {
            targetSocket.emit("signal", {
                signal: data.signal,
                from: socket.id,
            });
        }
    });

    // Remove o usuário quando desconecta
    socket.on("disconnect", () => {
        delete connectedUsers[socket.id];
        socket.broadcast.emit("user_disconnected", socket.id);
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

// Inicia o servidor na porta configurada pelo Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
