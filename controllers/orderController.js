const Order = require("../models/orderModels");
const dayjs = require("dayjs");
const getOrders = async (req, res) => {
  try {
    const orders = await Order.getOrdersByUser(res.locals.user_id);
    const formattedOrders = orders.map((order) => ({
      ...order,
      created_at: dayjs(order.created_at).format("DD-MM-YYYY, HH:mm A"),
    }));
    res.status(201).json({
      success: true,
      message: "Get Order successfully",
      order: formattedOrders,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const createOrder = async (req, res) => {
  const form = req.body;
  try {
    const result = await Order.createOrder(res.locals.user_id, form);
    const formattedResult = {
      ...result.order,
      created_at: dayjs(result.order.created_at).format("DD-MM-YYYY, HH:mm A"),
    };
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: formattedResult,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
const getOrderById = async (req, res) => {
  const { order_id } = req.params;
  try {
    const result = await Order.getOrderById(order_id, res.locals.user_id);
    const formattedResult = {
      ...result,
      created_at: dayjs(result.created_at).format("DD-MM-YYYY, HH:mm A"),
    };
    res.status(201).json({
      success: true,
      message: "Get Order successfully",
      order: formattedResult,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
module.exports = { createOrder, getOrders, getOrderById };
