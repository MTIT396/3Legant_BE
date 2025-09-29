const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

// POST /api/reviews
router.post("/", reviewController.createReview);

// Get /api/reviews/:product_id
router.get("/:product_id", reviewController.getReviewsByProduct);
module.exports = router;
