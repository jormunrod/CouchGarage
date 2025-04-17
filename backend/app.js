const express = require('express');
const maintenanceRoutes = require('./routes/maintenance');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
    res.send('The backend is running');
  });

// Routes
app.use('/api/maintenance', maintenanceRoutes);

// Initialize the server
app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
});