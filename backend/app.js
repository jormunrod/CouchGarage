const express = require('express');
const maintenanceRoutes = require('./routes/maintenance');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const { getDatabase } = require('./utils/couchdb');

(async () => {
  try {
    const db = await getDatabase();
    console.log("The database is ready to use.");
  } catch (error) {
    console.error("Failed to initialize the database:", error);
  }
})();

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
    res.send('The backend is running');
  });

// Routes
app.use('/api/maintenance', maintenanceRoutes);

// Initialize the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});