const express = require("express");
const {
  addToWishlist,
  getWishList,
  removeWishlist,
} = require("../controllers/wishlistController");
const jwtVerify = require("../middlewares/jwtVerify");
const router = express.Router();

router.post("/", jwtVerify, addToWishlist);
router.get("/", jwtVerify, getWishList);
router.delete("/", jwtVerify, removeWishlist);

module.exports = router;
