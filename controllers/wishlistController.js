// /api/wishlist

const pool = require("../config/db");
const Wishlist = require("../models/wishlistModels");
const addToWishlist = async (req, res) => {
  try {
    const { product_id, label, color } = req.body;
    const success = await Wishlist.addWishlistItem(
      res.locals.user_id,
      product_id,
      label,
      color
    );

    // Trả về danh sách wishlist sau khi thêm
    const wishlist = await Wishlist.getWishListData(res.locals.user_id);

    return res.status(200).json({
      success,
      message: success
        ? "Đã thêm vào mục yêu thích !"
        : "Sản phẩm đã có trong mục yêu thích !",
      wishlist,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const getWishList = async (req, res) => {
  try {
    const rows = await Wishlist.getWishListData(res.locals.user_id);
    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const removeWishlist = async (req, res) => {
  try {
    const { product_id, label, color } = req.body;

    const success = await Wishlist.removeWishlistItem(
      res.locals.user_id,
      product_id,
      label,
      color
    );

    const wishlist = await Wishlist.getWishListData(res.locals.user_id);
    return res.status(200).json({
      success,
      message: success
        ? "Đã xóa khỏi mục yêu thích !"
        : "Không tìm thấy sản phẩm trong mục yêu thích !",
      wishlist,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
module.exports = { addToWishlist, getWishList, removeWishlist };
