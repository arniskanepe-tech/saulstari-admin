const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve public files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// API — get materials
app.get("/api/materials", (req, res) => {
  const dataPath = path.join(__dirname, "data", "materials.json");
  const raw = fs.readFileSync(dataPath, "utf8");
  const json = JSON.parse(raw);
  res.json(json);
});

// Fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// PORT for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
