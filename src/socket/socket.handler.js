import { registerRoomEvents } from "./room.events.js";
import { registerGameEvents } from "./game.events.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    
    registerRoomEvents(io, socket);

    
    registerGameEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
