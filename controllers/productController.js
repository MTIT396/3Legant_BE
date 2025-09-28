const pool = require("../config/db");
const getNewestProducts = async (req, res) => {
  try {
    let { limit } = req.query;
    limit = limit ? parseInt(limit) : 10; // default 10 sản phẩm

    const [rows] = await pool.query(
      `SELECT * FROM nproducts ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    res.json({ success: true, products: rows });
  } catch (error) {
    console.error("Error fetching newest products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let { page, limit } = req.query;

    let query = `SELECT * FROM nproducts`;
    let values = [];

    if (page && limit) {
      // có query phân trang
      page = parseInt(page);
      limit = parseInt(limit);

      const offset = (page - 1) * limit;

      query += " LIMIT ? OFFSET ?";
      values.push(limit, offset);

      // đếm tổng sản phẩm
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total FROM nproducts`
      );
      const total = countRows[0].total;

      const [rows] = await pool.query(query, values);

      return res.json({
        success: true,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        products: rows,
      });
    } else {
      // nếu không có page & limit => trả tất cả
      const [rows] = await pool.query(query);
      return res.json({ success: true, products: rows });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const sql = "SELECT id, name, image_url FROM categories ";
    const [cat] = await pool.query(sql);
    return res.status(200).json({
      success: true,
      data: cat,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductBySearch = async (req, res) => {
  try {
    const { keywords } = req.query;
    if (!keywords) {
      return res.status(400).json({ message: "Keyword is required" });
    }
    const sql = "SELECT * FROM products WHERE name like ? ";
    const [products] = await pool.query(sql, [`%${keywords}%`]);
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Lấy sản phẩm chính
    const [productRows] = await pool.query(
      `SELECT * FROM nproducts WHERE id = ?`,
      [product_id]
    );
    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const product = productRows[0];

    // Lấy thông số kỹ thuật
    const [technicals] = await pool.query(
      `SELECT name, value 
       FROM product_technicals 
       WHERE product_id = ?`,
      [product_id]
    );

    // Lấy các biến thể
    const [variants] = await pool.query(
      `SELECT id, label, base_price, sale_price 
       FROM variants 
       WHERE product_id = ?`,
      [product_id]
    );

    // Lấy màu sắc của từng biến thể
    for (let v of variants) {
      const [colors] = await pool.query(
        `SELECT product_code, color_name, price 
         FROM variant_colors 
         WHERE variant_id = ?`,
        [v.id]
      );
      v.colors = colors;
    }

    // Lấy danh sách ảnh
    const [images] = await pool.query(
      `SELECT image_url 
       FROM product_images 
       WHERE product_id = ?`,
      [product_id]
    );

    // Trả về dữ liệu
    return res.status(200).json({
      success: true,
      data: {
        ...product,
        technicals,
        variants,
        images: images.map((img) => img.image_url),
      },
    });
  } catch (err) {
    console.error("❌ getProductById error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProductByFilter = async (req, res) => {
  try {
    const { categories, keywords, minPrice, maxPrice } = req.query;

    let sql = "SELECT * FROM nproducts";
    const conditions = [];
    const params = [];

    // Filter theo category
    if (categories) {
      const categoryIds = categories
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));

      if (categoryIds.length > 0) {
        const placeholders = categoryIds.map(() => "?").join(", ");
        conditions.push(`category_id IN (${placeholders})`);
        params.push(...categoryIds);
      }
    }

    // Filter theo price
    if (minPrice && maxPrice) {
      conditions.push("sale_price BETWEEN ? AND ?");
      params.push(Number(minPrice), Number(maxPrice));
    } else if (minPrice) {
      conditions.push("sale_price >= ?");
      params.push(Number(minPrice));
    } else if (maxPrice) {
      conditions.push("sale_price <= ?");
      params.push(Number(maxPrice));
    }

    // Filter theo keywords
    if (keywords) {
      conditions.push("name LIKE ?");
      params.push(`%${keywords}%`);
    }

    // Nếu có conditions thì nối WHERE
    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Error getProductByFilter:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getNewestProducts,
  getAllProducts,
  getAllCategories,
  getProductBySearch,
  getProductById,
  getProductByFilter,
};
