const pool = require("../config/db");

const getWishListData = async (user_id) => {
  const sql = `
    SELECT
      w.wishlist_id,
      w.product_id,
      w.user_id,
      w.label,
      w.color,
      w.added_at,

      p.name AS product_name,
      p.image_url,
      p.base_price,
      p.sale_price,

      -- final_price ưu tiên variant_colors -> variants -> nproducts
      COALESCE(
        (
          SELECT vc.price 
          FROM variant_colors vc
          JOIN variants vv ON vc.variant_id = vv.id
          WHERE vv.product_id = w.product_id
            AND vv.label = w.label
            AND vc.color_name = w.color
          LIMIT 1
        ),
        (
          SELECT v.sale_price
          FROM variants v
          WHERE v.product_id = w.product_id
            AND v.label = w.label
          LIMIT 1
        ),
        p.sale_price,
        p.base_price
      ) AS final_price

    FROM wishlists w
    JOIN nproducts p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.added_at DESC
  `;

  try {
    const [rows] = await pool.query(sql, [user_id]);
    return rows;
  } catch (err) {
    console.error("getWishListData SQL error:", err);
    console.error("SQL sent ->", sql);
    throw err;
  }
};

// Thêm item vào wishlist
const addWishlistItem = async (
  user_id,
  product_id,
  label = null,
  color = null
) => {
  // Check đã tồn tại chưa
  const [existedItem] = await pool.query(
    "SELECT * FROM wishlists WHERE user_id = ? AND product_id = ? AND label = ? AND color = ?",
    [user_id, product_id, label, color]
  );

  if (!existedItem[0]) {
    await pool.query(
      "INSERT INTO wishlists (user_id, product_id, label, color, added_at) VALUES (?, ?, ?, ?, NOW())",
      [user_id, product_id, label, color]
    );
    return true; // mới thêm
  }
  return false; // đã tồn tại
};

const removeWishlistItem = async (
  user_id,
  product_id,
  label = null,
  color = null
) => {
  const [result] = await pool.query(
    "DELETE FROM wishlists WHERE user_id = ? AND product_id = ? AND label <=> ? AND color <=> ?",
    [user_id, product_id, label, color]
  );
  return result.affectedRows > 0; // true nếu xóa thành công
};

module.exports = { getWishListData, addWishlistItem, removeWishlistItem };
