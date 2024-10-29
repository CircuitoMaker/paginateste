const socket = io();
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const permissionNotice = document.getElementById("permissionNotice");
let localStream;
let peerConnection;

const rtcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Solicita acesso à câmera e ao microfone com preferência para a câmera frontal
async function solicitarPermissoes() {
    try {
        const constraints = {
            video: { facingMode: "user" }, // Seleciona a câmera frontal no mobile
            audio: true,
        };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        permissionNotice.style.display = "none"; // Oculta a mensagem de permissão
        localVideo.srcObject = localStream;

        socket.on("new_peer", (id) => {
            iniciarPeerConnection(id);
        });

        socket.on("signal", async (data) => {
            if (data.signal.type === "offer") {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit("signal", { signal: answer, target: data.from });
            } else if (data.signal.type === "answer") {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
            } else if (data.signal.candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
            }
        });

        socket.on("user_disconnected", () => {
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
        });
    } catch (error) {
        console.error("Erro ao acessar a câmera ou microfone:", error);
        alert("Não foi possível acessar a câmera ou microfone. Verifique as permissões e tente novamente.");
    }
}

function iniciarPeerConnection(targetId) {
    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("signal", { signal: event.candidate, target: targetId });
        }
    };

    peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer);
        socket.emit("signal", { signal: offer, target: targetId });
    });
}

// Solicita permissões ao carregar a página
window.onload = () => {
    solicitarPermissoes();
    
};
