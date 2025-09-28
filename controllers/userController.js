const pool = require("../config/db");
const User = require("../models/userModels");

const getUser = async (req, res) => {
  try {
    const user = await User.getUserByUser_Id(res.locals.user_id);
    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Failed to get User", err);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Multer-storage-cloudinary tự trả về link Cloudinary trong req.file.path
    const imageUrl = req.file.path;
    // Lưu vào DB
    await User.updateAvatar(res.locals.user_id, imageUrl);
    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      url: imageUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

module.exports = { getUser, uploadImage };
