const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/auth.js");
const productRoutes = require("./routes/product.js");


const app = express();
app.use(express.json());
app.use(cors());

// DB connection
mongoose
  .connect("mongodb+srv://vishnu:vishnu2531@cluster0.5iwwd.mongodb.net/adminDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);


// Serve uploaded images as public URLs
app.use("/uploads", express.static("uploads"));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
