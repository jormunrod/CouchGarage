const express = require("express");
const router = express.Router();
const { getDatabase } = require("../utils/couchdb");
const axios = require("axios");

// Utilidad para extraer usuario autenticado desde la cookie
async function getSessionUser(req) {
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
    const username = await getSessionUser(req);
    if (!username) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const { carModel, date, description, cost, ...rest } = req.body;
    const doc = {
      carModel,
      date,
      description,
      cost: parseFloat(cost),
      userId: username,
      createdAt: new Date().toISOString(),
      ...rest,
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
    const result = await db.view("maintenances", "by_user", {
      key: username,
      include_docs: true,
    });
    const maintenances = result.rows.map((row) => row.doc);
    res.json(maintenances);
  } catch (error) {
    console.error("Error al listar mantenimientos:", error);
    res.status(500).json({ error: "Error al listar mantenimientos." });
  }
});

// --- Actualizar mantenimiento ---
router.put("/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const username = await getSessionUser(req);
    if (!username) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // 1. Obtener el doc original (por seguridad y para _rev)
    const doc = await db.get(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }
    if (doc.userId !== username) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // 2. Actualizar campos (solo los permitidos, pero admite personalizados)
    const updates = req.body;
    const camposNoEditables = [
      "_id", "_rev", "userId", "createdAt"
    ];
    for (const key of Object.keys(updates)) {
      if (!camposNoEditables.includes(key)) {
        doc[key] = updates[key];
      }
    }
    doc.updatedAt = new Date().toISOString();

    // 3. Guardar el doc actualizado
    const response = await db.insert(doc);
    const updatedDoc = await db.get(req.params.id); // devolver el actualizado
    res.json(updatedDoc);

  } catch (error) {
    console.error("Error al actualizar mantenimiento:", error);
    res.status(500).json({ error: "Error al actualizar mantenimiento." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const username = await getSessionUser(req);
    if (!username) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // 1. Obtener el doc original (por seguridad y para _rev)
    const doc = await db.get(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }
    if (doc.userId !== username) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // 2. Eliminar el documento usando _id y _rev
    await db.destroy(doc._id, doc._rev);
    res.json({ ok: true, id: doc._id });

  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);
    res.status(500).json({ error: "Error al eliminar mantenimiento." });
  }
});

module.exports = router;