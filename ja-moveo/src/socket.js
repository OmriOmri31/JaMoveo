// src/socket.js
import { io } from "socket.io-client";

// Connect to the Socket.io server using the environment variable
const socket = io(process.env.REACT_APP_SERVICE_TWO_URL);

socket.on("connect", () => {
    console.log("Connected to Socket.io server:", socket.id);
});

export default socket;
