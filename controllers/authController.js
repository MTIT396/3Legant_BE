const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function for validation
const validateCredentials = (username, password) => {
  if (!username && !password) {
    return {
      isValid: false,
      message: "Tài khoản và mật khẩu không được bỏ trống!",
    };
  }
  if (!username) {
    return { isValid: false, message: "Tài khoản không được bỏ trống!" };
  }
  if (!password) {
    return { isValid: false, message: "Mật khẩu không được bỏ trống!" };
  }
  return { isValid: true };
};

const register = async (req, res) => {
  const { username, password, email } = req.body;

  // Validation
  const validation = validateCredentials(username, password);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    // Check if user exists
    const [existed] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existed.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Tên người dùng hoặc email đã tồn tại!",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds
    await pool.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );

    return res.status(201).json({
      success: true,
      message: "Đăng kí tài khoản thành công!",
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống!",
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  // Validation
  const validation = validateCredentials(username, password);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    // Find user
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại!",
      });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Tên người dùng hoặc mật khẩu không đúng!",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set secure cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hour
    });

    return res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        id: user.user_id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống!",
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({
    success: true,
    message: "Đăng xuất thành công!",
  });
};

module.exports = {
  register,
  login,
  logout,
};
