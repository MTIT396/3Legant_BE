const express = require("express");

const router = express.Router();

const { register, login, logout } = require("../controllers/authController");
const jwtVerify = require("../middlewares/jwtVerify");
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
// Protected Routes
router.get("/protected", jwtVerify, (req, res) => {
  res.json({
    success: true,
    message: "Truy cập thành công!",
    userId: res.locals.user_id,
  });
});
module.exports = router;
