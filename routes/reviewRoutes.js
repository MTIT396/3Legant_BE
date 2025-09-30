const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const jwtVerify = require("../middlewares/jwtVerify");

// POST /api/reviews
router.post("/", jwtVerify, reviewController.createReview);

// Get /api/reviews/:product_id
router.get("/:product_id", reviewController.getReviewsByProduct);
module.exports = router;
