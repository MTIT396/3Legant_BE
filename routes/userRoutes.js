const express = require("express");
const router = express.Router();
const { getUser, uploadImage } = require("../controllers/userController");
const jwtVerify = require("../middlewares/jwtVerify");
const upload = require("../middlewares/upload"); // multer + cloudinary

// Lấy thông tin user
router.get("/user/me", jwtVerify, getUser);

// Upload avatar lên Cloudinary
router.post(
  "/user/upload-avatar",
  jwtVerify,
  upload.single("avatar"),
  uploadImage
);

module.exports = router;
