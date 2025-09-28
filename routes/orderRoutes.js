const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
} = require("../controllers/orderController");
const jwtVerify = require("../middlewares/jwtVerify");

// POST /api/orders
router.post("/", jwtVerify, createOrder);
router.get("/", jwtVerify, getOrders);
router.get("/:order_id", jwtVerify, getOrderById);

module.exports = router;
