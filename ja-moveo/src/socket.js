// Initialize a Socket.io client to connect to the server at "http://localhost:3001 locally"
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SERVICE_TWO_URL);

socket.on("connect", () => {
    console.log("Connected to Socket.io server:", socket.id);
});

export default socket;
