const pool = require("../config/db");
const Review = {
  create: async (user_id, product_id, rating, comment) => {
    const [result] = await pool.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [user_id, product_id, rating, comment]
    );
    return result.insertId;
  },
  findByProduct: async (product_id) => {
    const [rows] = await pool.query(
      `SELECT r.*, u.username AS user_name, u.avatar 
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC
       `,
      [product_id]
    );
    return rows;
  },
};

const ReviewItem = {
  create: async (review_id, criteria, score) => {
    const [result] = await pool.query(
      `INSERT INTO review_items (review_id, criterion, score) 
       VALUES (?, ?, ?)`,
      [review_id, criteria, score]
    );
    return result.insertId;
  },

  findByReview: async (review_id) => {
    const [rows] = await pool.query(
      `SELECT * FROM review_items WHERE review_id = ?`,
      [review_id]
    );
    return rows;
  },
  getRatingStats: async (product_id) => {
    const [rows] = await pool.query(
      `SELECT rating, COUNT(*) as count
     FROM reviews
     WHERE product_id = ?
     GROUP BY rating`,
      [product_id]
    );

    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach((r) => {
      stats[Number(r.rating)] = r.count;
    });

    return stats;
  },
};

module.exports = { Review, ReviewItem };
