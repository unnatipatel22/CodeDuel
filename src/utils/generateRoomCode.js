import Room from "../models/Room.model.js";


const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};


export const getUniqueRoomCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = generateRoomCode();
    const room = await Room.findOne({ roomCode: code });
    exists = !!room;
  }

  return code;
};
