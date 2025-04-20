const express = require("express");
const router = express.Router();
const { getDatabase } = require("../utils/couchdb");
const axios = require("axios");

// Utilidad para extraer usuario autenticado desde la cookie
async function getSessionUser(req) {
  // Extrae la cookie del request y consulta /_session en CouchDB
  const cookieHeader = req.headers.cookie || "";
  const sessionRes = await axios.get("http://couchdb:5984/_session", {
    headers: { Cookie: cookieHeader },
  });
  const userCtx = sessionRes.data && sessionRes.data.userCtx;
  if (userCtx && userCtx.name) return userCtx.name;
  return null;
}

// --- Crear mantenimiento ---
router.post("/", async (req, res) => {
  try {
    const db = await getDatabase();

    // 1. Identificar usuario autenticado desde la sesión
    const username = await getSessionUser(req);
    if (!username) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // 2. Tomar datos del mantenimiento del body
    const { carModel, date, description, cost } = req.body;
    if (!carModel || !date || !description || !cost) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    // 3. Guardar documento con el usuario asociado
    const doc = {
      carModel,
      date,
      description,
      cost: parseFloat(cost),
      userId: username, // Asociación segura
      createdAt: new Date().toISOString(),
    };

    const response = await db.insert(doc);
    res.status(201).json({ ok: true, id: response.id, rev: response.rev });
  } catch (error) {
    console.error("Error al guardar mantenimiento:", error);
    res.status(500).json({ error: "Error al guardar mantenimiento." });
  }
});

// --- Listar mantenimientos del usuario autenticado ---
router.get("/mine", async (req, res) => {
  try {
    const db = await getDatabase();
    const username = await getSessionUser(req);
    if (!username) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Usa la view para filtrar por userId
    const result = await db.view("maintenances", "by_user", {
      key: username,
      include_docs: true,
    });
    const maintenances = result.rows.map(row => row.doc);
    res.json(maintenances);
  } catch (error) {
    console.error("Error al listar mantenimientos:", error);
    res.status(500).json({ error: "Error al listar mantenimientos." });
  }
});

module.exports = router;