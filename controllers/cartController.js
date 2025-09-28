const Cart = require("../models/cartModels");
// [POST] /api/cart
const addToCart = async (req, res) => {
  const { product_id, quantity = 1, label, color } = req.body;
  try {
    await Cart.addCartItem(
      res.locals.user_id,
      product_id,
      quantity,
      label,
      color
    );

    const cartData = await Cart.getCartData(res.locals.user_id);
    const { total_price } = await Cart.getTotalPrice(res.locals.user_id);

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cart: cartData,
      total_items: cartData.length,
      total_price,
    });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// [GET] /api/cart
const getCart = async (req, res) => {
  try {
    const cartData = await Cart.getCartData(res.locals.user_id);
    const { total_price } = await Cart.getTotalPrice(res.locals.user_id);
    res.status(200).json({
      success: true,
      cart: cartData,
      total_items: cartData.length,
      total_price,
    });
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// [DELETE] /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.clearCart(res.locals.user_id);
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    console.error("Error in clearCart:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// [DELETE] /api/cart/:product_id
const removeFromCart = async (req, res) => {
  const { product_id } = req.params;
  const { label, color } = req.body;
  try {
    await Cart.removeCartItem(res.locals.user_id, product_id, label, color);

    const cartData = await Cart.getCartData(res.locals.user_id);
    const { total_price } = await Cart.getTotalPrice(res.locals.user_id);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: cartData,
      total_items: cartData.length,
      total_price,
    });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// [PUT] /api/cart/:product_id
const updateCartItem = async (req, res) => {
  const { product_id } = req.params;
  const { quantity, label, color } = req.body;

  try {
    await Cart.updateCartItem(
      res.locals.user_id,
      product_id,
      quantity,
      label,
      color
    );

    const cartData = await Cart.getCartData(res.locals.user_id);
    const { total_price } = await Cart.getTotalPrice(res.locals.user_id);

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      cart: cartData,
      total_items: cartData.length,
      total_price,
    });
  } catch (err) {
    console.error("Error in updateCartItem:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addToCart,
  getCart,
  clearCart,
  removeFromCart,
  updateCartItem,
};
