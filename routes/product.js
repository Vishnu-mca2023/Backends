const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Multer config
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")),
});
const upload = multer({ storage });

// Create product (protected)
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const product = await Product.create({
      name,
      price: Number(price),
      category,
      image: req.file.filename,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products (with category filter + sorting)
router.get("/", async (req, res) => {
  try {
    const { sort, category } = req.query;
    let query = {};

    if (category) {
      // Case-insensitive match
      query.category = new RegExp(`^${category}$`, "i");
    }

    const sortOption = {};
    if (sort === "desc") sortOption.price = -1;
    else if (sort === "asc") sortOption.price = 1;

    const products = await Product.find(query).sort(sortOption).exec();

    // 👇 Add full image URL dynamically
    const updatedProducts = products.map((p) => ({
      ...p._doc,
      image: `${req.protocol}://${req.get("host")}/uploads/${p.image}`,
    }));

    res.json(updatedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products (with category filter + sorting)
// router.get("/", async (req, res) => {
//   try {
//     const { sort, category } = req.query;
//     let query = {};

//     if (category) {
//       // Case-insensitive match
//       query.category = new RegExp(`^${category}$`, "i");
//     }

//     const sortOption = {};
//     if (sort === "desc") sortOption.price = -1;
//     else if (sort === "asc") sortOption.price = 1;

//     const products = await Product.find(query).sort(sortOption).exec();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// Get one product
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (price) updates.price = Number(price);
    if (category) updates.category = category;

    if (req.file) {
      const existing = await Product.findById(req.params.id);
      if (existing?.image) {
        const oldPath = path.join("uploads", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product?.image) {
      const imgPath = path.join("uploads", product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
