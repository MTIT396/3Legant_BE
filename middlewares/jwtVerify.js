const jwt = require("jsonwebtoken");

const jwtVerify = (req, res, next) => {
  try {
    // check if client sent cookie
    var { accessToken } = req.cookies;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Không có token, truy cập bị từ chối!",
      });
    }
    if (accessToken === undefined) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
    res.locals.user_id = payload.id;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Token đã hết hạn. Vui lòng đăng nhập lại!",
        });
    }

    if (err.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ success: false, message: "Token không hợp lệ!" });
    }

    console.error("JWT Verify Error:", err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
};

module.exports = jwtVerify;
