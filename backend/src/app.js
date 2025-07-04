const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const certificateRoutes = require("./routes/certificate");
const nftRoutes = require("./routes/nftroutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["https://nft-thesis.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/certificates", express.static(path.join(__dirname, "../certificates")));
app.use("/metadata", express.static(path.join(__dirname, "../metadata")));

// Routes
app.use("/api/certificate", certificateRoutes);
app.use("/api/nft", nftRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    details: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
