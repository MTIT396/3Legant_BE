const pool = require("../config/db");

// Lấy cart active của user
const findCart = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM cart WHERE user_id = ? LIMIT 1",
    [user_id]
  );
  return rows[0] || null;
};

// Thêm hoặc update item trong cart
const addCartItem = async (
  user_id,
  product_id,
  quantity,
  label = null,
  color = null
) => {
  if (!user_id || !product_id || quantity <= 0) {
    throw new Error("Invalid input parameters");
  }

  const now = new Date();
  let cart = await findCart(user_id);

  // Nếu chưa có cart => tạo mới
  if (!cart) {
    const [result] = await pool.query(
      "INSERT INTO cart (user_id, created_at, updated_at) VALUES (?, ?, ?)",
      [user_id, now, now]
    );
    cart = { id: result.insertId };
  }

  // Lấy giá sản phẩm từ bảng products
  const [productRows] = await pool.query(
    "SELECT sale_price FROM nproducts WHERE id = ? LIMIT 1",
    [product_id]
  );
  if (productRows.length === 0) {
    throw new Error("Product not found");
  }
  const unitPrice = productRows[0].sale_price; // giá 1 sản phẩm
  const totalPrice = unitPrice * quantity; // giá theo số lượng

  // Check sản phẩm đã có trong cart chưa (theo product_id + label + color)
  const [items] = await pool.query(
    `SELECT id, quantity, price 
     FROM cart_items 
     WHERE cart_id = ? AND product_id = ? AND label = ? AND color = ? 
     LIMIT 1`,
    [cart.id, product_id, label, color]
  );

  if (items.length > 0) {
    // Nếu đã tồn tại => cộng dồn quantity và cộng dồn price
    await pool.query(
      "UPDATE cart_items SET quantity = quantity + ?, price = price + ?, updated_at = ? WHERE id = ?",
      [quantity, totalPrice, now, items[0].id]
    );
  } else {
    // Nếu chưa có thì insert mới
    await pool.query(
      `INSERT INTO cart_items 
       (cart_id, product_id, quantity, label, color, price, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cart.id, product_id, quantity, label, color, totalPrice, now, now]
    );
  }
};

// Update số lượng item theo label + color
const updateCartItem = async (
  user_id,
  product_id,
  new_quantity,
  label = null,
  color = null
) => {
  const cart = await findCart(user_id);
  if (!cart) throw new Error("Cart not found");

  let query = `
    UPDATE cart_items ci
    JOIN cart c ON ci.cart_id = c.id
    SET ci.quantity = ?, ci.updated_at = NOW()
    WHERE c.user_id = ? AND ci.product_id = ?
  `;

  const params = [new_quantity, user_id, product_id];

  if (label) {
    query += " AND ci.label = ?";
    params.push(label);
  }

  if (color) {
    query += " AND ci.color = ?";
    params.push(color);
  }

  await pool.query(query, params);
};

// Xóa toàn bộ cart
const clearCart = async (user_id) => {
  await pool.query(
    "DELETE ci FROM cart_items ci JOIN cart c ON ci.cart_id = c.id WHERE user_id = ?",
    [user_id]
  );
};

// Xóa 1 item khỏi cart
const removeCartItem = async (
  user_id,
  product_id,
  label = null,
  color = null
) => {
  let query = `
    DELETE ci
    FROM cart c
    JOIN cart_items ci ON c.id = ci.cart_id
    WHERE c.user_id = ? AND ci.product_id = ?`;
  const params = [user_id, product_id];

  if (label) {
    query += " AND ci.label = ?";
    params.push(label);
  }
  if (color) {
    query += " AND ci.color = ?";
    params.push(color);
  }

  await pool.query(query, params);
};

// Lấy toàn bộ dữ liệu cart
const getCartData = async (user_id) => {
  const [rows] = await pool.query(
    `
    SELECT 
      ci.id AS cart_item_id,
      ci.quantity,
      ci.created_at,
      ci.updated_at,
      ci.label,
      ci.color,

      p.id AS product_id,
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
          WHERE vv.product_id = ci.product_id
            AND vv.label = ci.label
            AND vc.color_name = ci.color
          LIMIT 1
        ),
        (
          SELECT v.sale_price
          FROM variants v
          WHERE v.product_id = ci.product_id
            AND v.label = ci.label
          LIMIT 1
        ),
        p.sale_price,
        p.base_price
      ) AS final_price,

      c.id AS cart_id,
      c.user_id

    FROM cart c
    JOIN cart_items ci 
      ON c.id = ci.cart_id
    JOIN nproducts p 
      ON ci.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY ci.created_at DESC
    `,
    [user_id]
  );

  return rows;
};

// Tính tổng giá trị giỏ hàng
const getTotalPrice = async (user_id) => {
  const [rows] = await pool.query(
    `
    SELECT 
      SUM(ci.quantity * (
        COALESCE(
          (
            SELECT vc.price 
            FROM variant_colors vc
            JOIN variants vv ON vc.variant_id = vv.id
            WHERE vv.product_id = ci.product_id
              AND vv.label = ci.label
              AND vc.color_name = ci.color
            LIMIT 1
          ),
          (
            SELECT v.sale_price
            FROM variants v
            WHERE v.product_id = ci.product_id
              AND v.label = ci.label
            LIMIT 1
          ),
          p.sale_price,
          p.base_price
        )
      )) AS total_price
    FROM cart c
    JOIN cart_items ci 
      ON c.id = ci.cart_id
    JOIN nproducts p 
      ON ci.product_id = p.id
    WHERE c.user_id = ?
    `,
    [user_id]
  );

  return { total_price: rows[0]?.total_price ?? 0 };
};

module.exports = {
  addCartItem,
  updateCartItem,
  clearCart,
  removeCartItem,
  getCartData,
  getTotalPrice,
  findCart,
};
