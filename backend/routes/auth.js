const express = require("express");
// Create a dedicated Nano instance with admin credentials for registration.
const adminNano = require("nano")(
  `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@couchdb:5984`
);
const nano = require("nano")(
  `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@couchdb:5984`
);

const router = express.Router();
const adminUsersDB = adminNano.use("_users");
const usersDB = nano.use("_users");

// Route to register a new user.
// Uses the dedicated admin instance to ensure registration always runs with admin privileges.
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      error: "Username and password are required.",
    });
  }

  const userDoc = {
    _id: `org.couchdb.user:${username}`,
    name: username,
    password: password, // CouchDB will handle password hashing
    roles: [],
    type: "user",
  };

  try {
    await adminUsersDB.insert(userDoc);
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.statusCode === 409) {
      return res.status(409).send({ error: "User already exists" });
    }
    res
      .status(400)
      .send({ error: "Error registering user", details: error.message });
  }
});

// Route to log in
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      error: "Username and password are required.",
    });
  }

  try {
    // Authenticate the user using CouchDB's _session endpoint.
    const session = await nano.auth(username, password);

    // Set the AuthSession cookie with httpOnly flag for extra security and a maxAge for persistence.
    res.cookie("AuthSession", session.cookie, { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000  // 24 hours
    });
    res.status(200).send({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    if (error.statusCode === 401) {
      return res.status(401).send({ error: "Invalid credentials" });
    }
    res
      .status(500)
      .send({ error: "Error logging in", details: error.message });
  }
});

// Protected route as an example
router.get("/protected", async (req, res) => {
  try {
    // Retrieve session information from CouchDB using the request cookie.
    const sessionInfo = await nano.session();

    if (sessionInfo.userCtx && sessionInfo.userCtx.name) {
      res
        .status(200)
        .send({ message: "Access granted", user: sessionInfo.userCtx });
    } else {
      res.status(401).send({ error: "Invalid session" });
    }
  } catch (error) {
    console.error("Error validating session:", error);
    res
      .status(500)
      .send({ error: "Error validating session", details: error.message });
  }
});

// Route to log out
router.post("/logout", async (req, res) => {
  try {
    // Optionally, you can call CouchDB's DELETE /_session endpoint here to invalidate the session on the server side.
    // For simplicity, we clear theAuthSession cookie so that subsequent requests will not be authenticated.
    res.clearCookie("AuthSession");
    res.status(200).send({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res
      .status(500)
      .send({ error: "Error logging out", details: error.message });
  }
});

module.exports = router;