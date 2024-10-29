// public/socket.js
const socket = io(); // Conecta ao servidor Socket.io

// Notifica quando um novo peer se conecta
socket.on("new_peer", (peerId) => {
    console.log(`Novo peer conectado: ${peerId}`);
    // Aqui você pode adicionar lógica para gerenciar a conexão WebRTC
});

// Recebe sinais de outros peers
socket.on("signal", (data) => {
    console.log(`Sinal recebido de ${data.from}:`, data.signal);
    // Aqui você pode usar os dados do sinal para configurar sua conexão WebRTC
});

// Notifica quando um peer desconecta
socket.on("user_disconnected", (peerId) => {
    console.log(`Peer desconectado: ${peerId}`);
    // Aqui você pode adicionar lógica para lidar com a desconexão
});

// Lidar com erros na conexão
socket.on("connect_error", (error) => {
    console.error("Erro de conexão:", error);
});

// Enviar sinal para outro peer
function sendSignal(targetPeerId, signalData) {
    socket.emit("signal", {
        target: targetPeerId,
        signal: signalData,
    });
}

// Função para lidar com a permissão de câmera e microfone
async function setupMedia() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const localVideo = document.getElementById("localVideo");
        localVideo.srcObject = stream;

        // Aqui você pode adicionar lógica para compartilhar o stream com o outro peer
    } catch (err) {
        console.error("Erro ao acessar mídia:", err);
    }
}

// Chame essa função ao carregar a página
setupMedia();
