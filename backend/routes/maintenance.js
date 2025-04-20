const express = require('express');
const router = express.Router();
const database = require('../utils/couchdb');

// Middleware para verificar la sesión del usuario
const authenticateUser = async (req, res, next) => {
  try {
    const session = await nanoAuth.session({
      headers: { Cookie: req.headers.cookie || "" },
    });
    if (session.userCtx && session.userCtx.name) {
      req.user = session.userCtx;
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error validating session' });
  }
};

// Aplicar middleware a todas las rutas de mantenimiento
router.use(authenticateUser);

// Crear un nuevo mantenimiento (asociado al usuario logueado)
router.post('/', async (req, res) => {
  try {
    const maintenanceData = {
      ...req.body,
      userId: req.user.name, // Añade el ID del usuario
      createdAt: new Date().toISOString()
    };
    const response = await database.insert(maintenanceData);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ error: 'Error creating maintenance.' });
  }
});

// Listar todos los mantenimientos del usuario logueado
router.get('/', async (req, res) => {
  try {
    // Usar una vista de CouchDB que filtre por userId
    const response = await database.view('maintenances', 'by_user', {
      key: req.user.name,
      include_docs: true
    });
    const maintenances = response.rows.map(row => row.doc);
    res.status(200).json(maintenances);
  } catch (error) {
    console.error('Error listing maintenances:', error);
    res.status(500).json({ error: 'Error listing maintenances.' });
  }
});

module.exports = router;