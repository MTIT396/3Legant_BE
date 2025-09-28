const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getAllCategories,
  getProductById,
  getProductByFilter,
  getNewestProducts,
} = require("../controllers/productController");

// All Products API
router.get("/", getAllProducts);

router.get("/newest", getNewestProducts);

router.get("/categories", getAllCategories);

// Get Product By Filter And Search
router.get("/filter", getProductByFilter);
// Get Product By Id
router.get("/:product_id", getProductById);

module.exports = router;
