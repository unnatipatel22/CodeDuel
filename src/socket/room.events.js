import Room from "../models/Room.model.js";
import Problem from "../models/Problem.model.js";
import { selectProblemForRoom } from "../controllers/room.controller.js";

export const registerRoomEvents = (io, socket) => {

  
  
  socket.on("join-room", async ({ roomCode, userId, username }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Join socket room
      socket.join(roomCode);
      console.log(`${username} joined room ${roomCode}`);

      // Update player socket ID
      const player = room.players.find((p) => p.userId.toString() === userId);
      if (player) {
        player.socketId = socket.id;
        await room.save();
      }

      // If practice mode, start immediately
      if (room.mode === "practice") {
        if (!room.problemId) {
          socket.emit("error", { message: "No problem assigned to this room yet. Please try again." });
          return;
        }
        const problem = await Problem.findById(room.problemId);
        if (!problem) {
          socket.emit("error", { message: "Problem not found. Please create a new room." });
          return;
        }
        socket.emit("game-start", {
          problem: {
            id: problem._id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            examples: problem.examples,
            constraints: problem.constraints,
            starterCode: problem.starterCode,
          },
          timeLimit: room.timeLimit,
          startedAt: room.startedAt,
        });
        return;
      }

      // Broadcast room update to all players
      io.to(roomCode).emit("room-update", {
        players: room.players.map((p) => ({
          userId: p.userId,
          username: p.username,
          isReady: p.isReady,
        })),
        creatorId: room.creatorId,
        mode: room.mode,
        difficulty: room.difficulty,
        topic: room.topic || "all",
        timeLimit: room.timeLimit,
        maxPlayers: room.maxPlayers || 2,
      });

      // 1v1 Mode: Auto-start if 2 players join
      if (room.mode === "1v1" && room.players.length === 2) {
        io.to(roomCode).emit("room-ready", {
          message: "Both players joined! Game starting soon...",
          players: room.players.map((p) => ({ username: p.username })),
        });

        setTimeout(async () => {
          const freshRoom = await Room.findOne({ roomCode });
          if (freshRoom && freshRoom.status === "waiting") {
            await startGame(io, freshRoom);
          }
        }, 3000);
      }
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // Toggle ready status
  socket.on("toggle-ready", async ({ roomCode, userId }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room) return;

      const player = room.players.find((p) => p.userId.toString() === userId);
      if (player) {
        player.isReady = !player.isReady;
        await room.save();
      }

      io.to(roomCode).emit("room-update", {
        players: room.players.map((p) => ({
          userId: p.userId,
          username: p.username,
          isReady: p.isReady,
        })),
        creatorId: room.creatorId,
        mode: room.mode,
        difficulty: room.difficulty,
        topic: room.topic || "all",
        timeLimit: room.timeLimit,
        maxPlayers: room.maxPlayers || 2,
      });

      // Auto start in multiplayer mode only if everyone is ready and count is maxed out
      const allReady = room.players.every((p) => p.isReady);
      if (allReady && room.players.length >= room.maxPlayers && room.players.length >= 2) {
        io.to(roomCode).emit("room-ready", {
          message: "All players ready! Game starting...",
        });
        setTimeout(async () => {
          const freshRoom = await Room.findOne({ roomCode });
          if (freshRoom && freshRoom.status === "waiting") {
            await startGame(io, freshRoom);
          }
        }, 3000);
      }
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // Host starts the match manually
  socket.on("host-start-match", async ({ roomCode, userId }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room) return;

      if (room.creatorId && room.creatorId.toString() !== userId) {
        socket.emit("error", { message: "Only the host can start the match!" });
        return;
      }

      if (room.players.length < 2) {
        socket.emit("error", { message: "Need at least 2 players to start a match!" });
        return;
      }

      io.to(roomCode).emit("room-ready", {
        message: "Host started the match! Game starting...",
      });

      setTimeout(async () => {
        const freshRoom = await Room.findOne({ roomCode });
        if (freshRoom && freshRoom.status === "waiting") {
          await startGame(io, freshRoom);
        }
      }, 3000);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("disconnecting", async () => {
    const rooms = Array.from(socket.rooms);
    for (const roomCode of rooms) {
      if (roomCode !== socket.id) {
        const room = await Room.findOne({ roomCode });
        if (!room) continue;

        const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);
        if (playerIndex !== -1) {
          const username = room.players[playerIndex].username;

          if (room.status === "waiting") {
            // Remove player from lobby
            room.players.splice(playerIndex, 1);
            await room.save();

            io.to(roomCode).emit("room-update", {
              players: room.players.map((p) => ({
                userId: p.userId,
                username: p.username,
                isReady: p.isReady,
              })),
              creatorId: room.creatorId,
              mode: room.mode,
              difficulty: room.difficulty,
              topic: room.topic || "all",
              timeLimit: room.timeLimit,
              maxPlayers: room.maxPlayers || 2,
            });
          } else if (room.status === "live") {
            socket.to(roomCode).emit("opponent-left", {
              message: `${username} disconnected!`,
            });

            // Check how many players are still connected
            const connectedSockets = io.sockets.adapter.rooms.get(roomCode);
            const connectedCount = connectedSockets ? connectedSockets.size : 0;

            // End game if 1v1 or if only 1 player remains connected
            if (room.mode === "1v1" || connectedCount <= 1) {
              await Room.findOneAndUpdate(
                { roomCode, status: "live" },
                { status: "finished", finishedAt: new Date() }
              );
              io.to(roomCode).emit("game-over", {
                message: "Game concluded as there are not enough players left.",
                winnerUsername: "None (Player Disconnected)",
                submission: null
              });
            }
          }
        }
      }
    }
  });
};


const startGame = async (io, room) => {
  try {
    const problem = await selectProblemForRoom(room.difficulty, room.topic);
    if (!problem) {
      throw new Error("No matching problems found");
    }

    room.status = "live";
    room.problemId = problem._id;
    room.startedAt = new Date();
    await room.save();

    io.to(room.roomCode).emit("game-start", {
      problem: {
        id: problem._id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        examples: problem.examples,
        constraints: problem.constraints,
        starterCode: problem.starterCode,
      },
      timeLimit: room.timeLimit, 
      startedAt: room.startedAt,
    });

    console.log(`🎮 Game started in room ${room.roomCode}`);

    startTimer(io, room.roomCode, room.timeLimit);
  } catch (err) {
    io.to(room.roomCode).emit("error", { message: "Failed to start game: " + err.message });
  }
};


const startTimer = (io, roomCode, timeLimit) => {
  let remaining = timeLimit;

  const interval = setInterval(async () => {
    remaining--;
    io.to(roomCode).emit("timer-tick", { remaining });

    if (remaining <= 0) {
      clearInterval(interval);
      io.to(roomCode).emit("time-up", {
        message: "Time's up! No winner this round.",
      });

      await Room.findOneAndUpdate(
        { roomCode, status: "live" },
        { status: "finished", finishedAt: new Date() }
      );
    }
  }, 1000);
};
