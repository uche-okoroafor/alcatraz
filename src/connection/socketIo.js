import { SOCKET_IO_URL } from "../endpoints";
import io from "socket.io-client";

export const socket = io(SOCKET_IO_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
});