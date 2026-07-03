export const registerGameEvents = (io, socket) => {

  
  
  socket.on("code-update", ({ roomCode, username, linesWritten }) => {
    socket.to(roomCode).emit("opponent-coding", {
      username,
      linesWritten, 
    });
  });

  
  
  socket.on("player-submitted", ({ roomCode, username }) => {
    socket.to(roomCode).emit("opponent-submitted", {
      message: `${username} has submitted their solution!`,
    });
  });

  
  
  socket.on("send-message", ({ roomCode, username, message }) => {
    if (!message || message.trim().length === 0) return;
    if (message.length > 200) return; 

    io.to(roomCode).emit("new-message", {
      username,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });
  });

  
  socket.on("send-emote", ({ roomCode, username, emote }) => {
    if (!emote) return;
    io.to(roomCode).emit("new-emote", {
      username,
      emote,
    });
  });
};
