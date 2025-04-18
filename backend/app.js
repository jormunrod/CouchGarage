const express = require("express");
const maintenanceRoutes = require("./routes/maintenance");
const authRoutes = require("./routes/auth");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const { getDatabase } = require("./utils/couchdb");

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

app.get("/", (req, res) => {
  res.send("The backend is running");
});

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/auth", authRoutes);

// Initialize the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
