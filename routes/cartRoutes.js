const express = require("express");
const {
  getCart,
  addToCart,
  clearCart,
  removeFromCart,
  updateCartItem,
} = require("../controllers/cartController");
const jwtVerify = require("../middlewares/jwtVerify");

const router = express.Router();

router.get("/", jwtVerify, getCart);
router.post("/", jwtVerify, addToCart);
router.put("/:product_id", jwtVerify, updateCartItem);
router.delete("/", jwtVerify, clearCart);
router.delete("/:product_id", jwtVerify, removeFromCart);

module.exports = router;
