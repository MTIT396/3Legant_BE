const pool = require("../config/db");

const User = {
  getUserByUser_Id: async (user_id) => {
    const [rows] = await pool.execute("SELECT * FROM users WHERE user_id = ?", [
      user_id,
    ]);
    return rows[0];
  },

  updateAvatar: async (user_id, avatarUrl) => {
    await pool.execute("UPDATE users SET avatar = ? WHERE user_id = ?", [
      avatarUrl,
      user_id,
    ]);
  },
};

module.exports = User;
