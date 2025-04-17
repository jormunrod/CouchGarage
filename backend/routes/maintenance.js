const express = require('express');
const router = express.Router();
const database = require('../utils/couchdb');

// Create a new maintenance
router.post('/', async (req, res) => {
  try {
    const response = await database.insert(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ error: 'Error creating maintenance.' });
  }
});

// List all maintenances
router.get('/', async (req, res) => {
  try {
    const response = await database.view('_all_docs', { include_docs: true });
    const maintenances = response.rows.map(row => row.doc);
    res.status(200).json(maintenances);
  } catch (error) {
    console.error('Error listing maintenances:', error);
    res.status(500).json({ error: 'Error listing maintenances.' });
  }
});

// Get a specific maintenance by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await database.get(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(404).json({ error: 'Maintenance not found.' });
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
    console.error('Error updating maintenance:', error);
    res.status(500).json({ error: 'Error updating maintenance.' });
  }
});

// Delete a maintenance
router.delete('/:id', async (req, res) => {
  try {
    const doc = await database.get(req.params.id);
    const response = await database.destroy(doc._id, doc._rev);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    res.status(500).json({ error: 'Error deleting maintenance.' });
  }
});

module.exports = router;