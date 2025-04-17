const nano = require("nano");
require("dotenv").config();

// Expected COUCHDB_URL to include credentials, e.g.:
// http://admin:admin@couchdb:5984
const couchdbUrl = "http://admin:admin@couchdb:5984";
const couchdb = nano(couchdbUrl);

const databaseName = "car_maintenances";
const seedData = [
  {
    brand: "Toyota",
    model: "Corolla",
    licensePlate: "1234-ABC",
    maintenanceDate: "2025-04-15",
    maintenanceType: ["Oil Change", "Brake Check"],
    cost: 150,
    comments: "Performed at XYZ Mechanical Workshop",
  },
  {
    brand: "Honda",
    model: "Civic",
    licensePlate: "5678-DEF",
    maintenanceDate: "2025-05-20",
    maintenanceType: ["Tire Rotation", "Fluid Check"],
    cost: 100,
    comments: "Performed at ABC Auto Service",
  },
  {
    brand: "Ford",
    model: "Focus",
    licensePlate: "9101-GHI",
    maintenanceDate: "2025-06-10",
    maintenanceType: ["Battery Replacement"],
    cost: 200,
    comments: "Performed at DEF Garage",
  },
  {
    brand: "Chevrolet",
    model: "Malibu",
    licensePlate: "1122-JKL",
    maintenanceDate: "2025-07-05",
    maintenanceType: ["Brake Pad Replacement"],
    cost: 250,
    comments: "Performed at GHI Auto Repair",
  },
  {
    brand: "Nissan",
    model: "Altima",
    licensePlate: "3344-MNO",
    maintenanceDate: "2025-08-15",
    maintenanceType: ["Transmission Fluid Change"],
    cost: 300,
    comments: "Performed at JKL Service Center",
  },
];

/**
 * Function to wait for CouchDB availability using the /_up endpoint.
 * This endpoint responds without requiring additional authentication and is suitable for health checks.
 */
async function waitForCouchDB(maxRetries = 10, delay = 5000) {
  let retries = 0;
  // Build the URL for the /_up endpoint from the base URL.
  const upUrl = new URL("/_up", couchdbUrl).toString();

  while (retries < maxRetries) {
    try {
      const response = await require("axios").get(upUrl);
      if (response.data && response.data.status === "ok") {
        console.log("CouchDB is ready.");
        return;
      }
    } catch (error) {
      retries++;
      console.log(`Waiting for CouchDB... attempt ${retries}/${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("CouchDB did not respond after several attempts.");
}

/**
 * Function to set up the database:
 * - Waits for CouchDB to be ready.
 * - Creates the database if it does not exist.
 * - Inserts initial data if the database is empty.
 */
async function setupDatabase() {
  try {
    await waitForCouchDB();

    // Check if the database exists.
    const dbList = await couchdb.db.list();
    if (!dbList.includes(databaseName)) {
      console.log(`Database ${databaseName} does not exist. Creating it...`);
      await couchdb.db.create(databaseName);
      console.log(`Database ${databaseName} created.`);
    }

    const database = couchdb.use(databaseName);

    // Check if the database is empty.
    const docs = await database.list({ limit: 1 });
    if (docs.rows.length === 0) {
      console.log(
        `Database ${databaseName} is empty. Inserting initial data...`
      );
      const bulkResponse = await database.bulk({ docs: seedData });
      console.log("Initial data inserted:", bulkResponse);
    } else {
      console.log(`Database ${databaseName} already contains data.`);
    }

    return database;
  } catch (error) {
    console.error("Error setting up the database:", error);
    throw error;
  }
}

// Start the database setup and export a function to retrieve it.
const databasePromise = setupDatabase();

module.exports = {
  getDatabase: async function () {
    return await databasePromise;
  },
};
