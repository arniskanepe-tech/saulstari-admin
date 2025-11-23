const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Palīgfunkcijas =====
const dataPath = path.join(__dirname, "data", "materials.json");

function readMaterials() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(raw);
}

function writeMaterials(list) {
  fs.writeFileSync(dataPath, JSON.stringify(list, null, 2), "utf8");
}

function nowString() {
  const d = new Date();
  const iso = d.toISOString().slice(0, 16); // "2025-01-10T12:30"
  return iso.replace("T", " ");
}

// ===== Statiskie faili (frontend) =====
app.use(express.static(path.join(__dirname, "public")));

// ===== API: materiāli =====

// GET visi materiāli
app.get("/api/materials", (req, res) => {
  const list = readMaterials();
  res.json(list);
});

// POST jauns materiāls
app.post("/api/materials", (req, res) => {
  const list = readMaterials();
  const { name, price, unit, availability, note } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nosaukums ir obligāts" });
  }

  const maxId = list.reduce((max, m) => (m.id > max ? m.id : max), 0);
  const ts = nowString();

  const newItem = {
    id: maxId + 1,
    name,
    price: price || "",
    unit: unit || "",
    availability: availability || "available", // available | limited | not_available
    note: note || "",
    updated_at: ts
  };

  list.push(newItem);

  // atjaunojam datumu VISIEM materiāliem
  list.forEach(m => {
    m.updated_at = ts;
  });

  writeMaterials(list);
  res.status(201).json(newItem);
});

// PUT esoša materiāla labošana
app.put("/api/materials/:id", (req, res) => {
  const id = Number(req.params.id);
  const list = readMaterials();
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Materiāls nav atrasts" });

  const { name, price, unit, availability, note } = req.body;

  if (name !== undefined) list[idx].name = name;
  if (price !== undefined) list[idx].price = price;
  if (unit !== undefined) list[idx].unit = unit;
  if (availability !== undefined) list[idx].availability = availability;
  if (note !== undefined) list[idx].note = note;

  const ts = nowString();
  // atjaunojam datumu visiem
  list.forEach(m => {
    m.updated_at = ts;
  });

  writeMaterials(list);
  res.json(list[idx]);
});

// DELETE materiāls
app.delete("/api/materials/:id", (req, res) => {
  const id = Number(req.params.id);
  const list = readMaterials();
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Materiāls nav atrasts" });

  const removed = list.splice(idx, 1)[0];

  const ts = nowString();
  list.forEach(m => {
    m.updated_at = ts;
  });

  writeMaterials(list);
  res.json(removed);
});

// Fallback route — servē index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== Servera palaišana =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
