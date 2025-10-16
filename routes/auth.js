const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.js");





const router = express.Router();
const JWT_SECRET = "supersecretkey"; // change in production

let tokenBlacklist = []; // store logged-out tokens

// Seed admin (only one time if DB empty)
router.post("/seed-admin", async (req, res) => {
  try {
    const existing = await Admin.findOne({ username: "admin" });
    if (existing) return res.json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash("admin123", 10);
    await Admin.create({ username: "admin", password: hashed });

    res.json({ message: "Admin created: username=admin, password=admin123" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route example
router.get("/dashboard", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  if (tokenBlacklist.includes(token)) return res.status(403).json({ message: "Logged out" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: "Welcome Admin Dashboard", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) tokenBlacklist.push(token);
  res.json({ message: "Logged out successfully" });
});
module.exports = router;
