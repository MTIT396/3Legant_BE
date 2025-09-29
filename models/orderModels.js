const pool = require("../config/db");
const Cart = require("./cartModels");
// Lấy danh sách orders của user
const getOrdersByUser = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT id AS order_id, user_id, total_price, status, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [user_id]
  );
  return rows;
};

// Lấy chi tiết order + items
const getOrderById = async (order_id, user_id) => {
  const [orders] = await pool.query(
    `SELECT id AS order_id, user_id, total_price, status, created_at, payment_method, first_name, last_name, phone_number, email, address, city
     FROM orders
     WHERE id = ? AND user_id = ?`,
    [order_id, user_id]
  );

  if (orders.length === 0) return null;

  const [items] = await pool.query(
    `SELECT oi.id AS order_item_id, oi.product_id, oi.quantity, oi.price , oi.label, oi.color,
            p.name, p.image_url
     FROM order_items oi
     JOIN nproducts p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [order_id]
  );

  return { ...orders[0], items };
};

const createOrder = async (user_id, form) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Lấy cart active
    const cart = await Cart.getCartData(user_id);
    const { total_price } = await Cart.getTotalPrice(user_id);

    if (cart.length === 0) {
      throw new Error("No active cart found");
    }

    const cartId = cart[0].cart_id;

    // 2. Tạo order mới
    const [orderResult] = await conn.query(
      "INSERT INTO orders (user_id, total_price, status, created_at, first_name, last_name, phone_number, email, address, city, payment_method ) VALUES (?, ?, 'pending', ?,?,?,?,?,?,?,?)",
      [
        user_id,
        total_price,
        new Date(),
        form.first_name,
        form.last_name,
        form.phone_number,
        form.email,
        form.address,
        form.city,
        form.payment_method,
      ]
    );
    const orderId = orderResult.insertId;

    // 3. Copy cart_items sang order_items
    await conn.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price , label, color)
       SELECT ?, ci.product_id, ci.quantity, ci.price, ci.label, ci.color
       FROM cart_items ci
       JOIN nproducts p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [orderId, cartId]
    );

    // // 4. Cập nhật cart thành completed
    // await conn.query("UPDATE cart SET status = 'completed' WHERE id = ?", [
    //   cartId,
    // ]);

    const [orderData] = await conn.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);
    await conn.commit();

    return { order: orderData[0] };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
module.exports = { createOrder, getOrdersByUser, getOrderById };
