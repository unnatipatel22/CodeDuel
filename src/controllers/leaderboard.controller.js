import User from "../models/User.model.js";


export const getLeaderboard = async (req, res, next) => {
  try {
    const players = await User.find({ totalMatches: { $gt: 0 } })
      .sort({ wins: -1, totalMatches: 1 }) 
      .limit(20)
      .select("username wins losses totalMatches");

    const leaderboard = players.map((player, index) => ({
      rank: index + 1,
      username: player.username,
      wins: player.wins,
      losses: player.losses,
      totalMatches: player.totalMatches,
      winRate:
        player.totalMatches > 0
          ? Math.round((player.wins / player.totalMatches) * 100)
          : 0,
    }));

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};
