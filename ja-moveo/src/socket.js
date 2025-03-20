// Initialize a Socket.io client to connect to the server at "http://localhost:3001"
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log("Connected to Socket.io server:", socket.id);
});

export default socket;
