const pool = require("../config/db");
const { ReviewItem, Review } = require("../models/reviewModels");

const reviewController = {
  createReview: async (req, res) => {
    try {
      const { product_id, rating, comment, items } = req.body;
      const reviewId = await Review.create(
        res.locals.user_id,
        product_id,
        rating,
        comment
      );

      // nếu có items chi tiết thì insert luôn
      if (Array.isArray(items)) {
        for (const item of items) {
          await ReviewItem.create(reviewId, item.criterion, item.score);
        }
      }

      res.json({ message: "Review created", review_id: reviewId });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  getReviewsByProduct: async (req, res) => {
    try {
      const { product_id } = req.params;
      const reviews = await Review.findByProduct(product_id);
      const stats = await ReviewItem.getRatingStats(product_id);
      // tổng hợp items để lấy average criterion
      const sums = {};
      const counts = {};
      let totalRating = 0;
      let ratingCount = 0;

      for (const r of reviews) {
        r.items = await ReviewItem.findByReview(r.id);

        // cộng rating của review (nếu có trường rating)
        if (r.rating != null) {
          totalRating += Number(r.rating);
          ratingCount += 1;
        }

        // cộng điểm theo từng criterion
        for (const item of r.items) {
          if (!sums[item.criterion]) {
            sums[item.criterion] = 0;
            counts[item.criterion] = 0;
          }
          sums[item.criterion] += Number(item.score);
          counts[item.criterion] += 1;
        }
      }

      // trung bình theo từng criterion
      const average_criterion = {};
      for (const key in sums) {
        average_criterion[key] = sums[key] / counts[key];
      }

      // trung bình rating (từ cột rating trong bảng reviews)
      const average_rating = ratingCount > 0 ? totalRating / ratingCount : 0;

      res.json({
        reviews,
        average_criterion,
        average_rating,
        stats,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = reviewController;
