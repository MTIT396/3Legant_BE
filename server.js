require("dotenv").config();
const pool = require("./config/db");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ================= API Routes =================
// Auth
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Cart
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

// Product
const productRoutes = require("./routes/productsRoutes");
app.use("/api/products", productRoutes);

// Wishlists
const wishlistRoutes = require("./routes/wishlistRoutes");
app.use("/api/wishlists", wishlistRoutes);

// User
const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);

// Orders
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// Reviews
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening at port: ${port}`);
});
