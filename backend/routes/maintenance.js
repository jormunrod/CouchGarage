const express = require('express');
const router = express.Router();
const database = require('../utils/couchdb');

// Create a new maintenance
router.post('/', async (req, res) => {
  try {
    const response = await database.insert(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error al crear mantenimiento:', error);
    res.status(500).json({ error: 'Error al crear el mantenimiento.' });
  }
});

// List all maintenances
router.get('/', async (req, res) => {
  try {
    const response = await database.view('_all_docs', { include_docs: true });
    const maintenances = response.rows.map(row => row.doc);
    res.status(200).json(maintenances);
  } catch (error) {
    console.error('Error al listar mantenimientos:', error);
    res.status(500).json({ error: 'Error al listar los mantenimientos.' });
  }
});

// Get a specific maintenance by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await database.get(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error al obtener mantenimiento:', error);
    res.status(404).json({ error: 'Mantenimiento no encontrado.' });
  }
});

// Update a maintenance
router.put('/:id', async (req, res) => {
  try {
    const doc = await database.get(req.params.id);
    const updatedDoc = { ...doc, ...req.body };
    const response = await database.insert(updatedDoc);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error);
    res.status(500).json({ error: 'Error al actualizar el mantenimiento.' });
  }
});

// Delete a maintenance
router.delete('/:id', async (req, res) => {
  try {
    const doc = await database.get(req.params.id);
    const response = await database.destroy(doc._id, doc._rev);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error);
    res.status(500).json({ error: 'Error al eliminar el mantenimiento.' });
  }
});

module.exports = router;