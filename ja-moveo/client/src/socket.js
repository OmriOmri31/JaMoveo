import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SERVICE_TWO_URL, { transports: ['websocket'] });

export default socket;
