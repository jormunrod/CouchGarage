const express = require("express");
const axios = require("axios");
const nano = require("nano");

// Create a dedicated Nano instance with admin credentials for registration.
const adminNano = nano(
  `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@couchdb:5984`
);
// Create a Nano instance without credentials for user session operations.
const nanoAuth = nano("http://couchdb:5984");

const router = express.Router();
const adminUsersDB = adminNano.use("_users");

// --- UTILS ---

/**
 * Extracts the value of a cookie from a Set-Cookie header string.
 * @param {string[]} setCookieArray - Array of Set-Cookie strings.
 * @param {string} cookieName - Name of the cookie to extract.
 * @returns {string|null} - Value of the cookie or null if not found.
 */
function extractCookieValue(setCookieArray, cookieName) {
  if (!setCookieArray) return null;
  const cookieStr = setCookieArray.find((str) =>
    str.startsWith(`${cookieName}=`)
  );
  if (!cookieStr) return null;
  // Only the value, remove key and up to ;
  const match = cookieStr.match(new RegExp(`${cookieName}=([^;]+)`));
  return match ? match[1] : null;
}

// --- REGISTER ROUTE ---
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

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      error: "Username and password are required.",
    });
  }

  try {
    // Manual request to CouchDB _session endpoint for correct cookie
    const response = await axios.post(
      "http://couchdb:5984/_session",
      `name=${encodeURIComponent(username)}&password=${encodeURIComponent(
        password
      )}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      }
    );

    // Extract AuthSession cookie value
    const cookieValue = extractCookieValue(
      response.headers["set-cookie"],
      "AuthSession"
    );

    if (cookieValue) {
      // Add SameSite and secure flags as needed for production
      res.cookie("AuthSession", cookieValue, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax", // or "strict" if your frontend is on the same site
        // secure: true, // Uncomment if using HTTPS
        path: "/",
      });
      return res.status(200).send({ message: "Login successful" });
    }

    // No AuthSession cookie found
    return res.status(401).send({ error: "No AuthSession cookie in response" });
  } catch (error) {
    console.error("Error logging in:", error);
    if (error.response && error.response.status === 401) {
      return res.status(401).send({ error: "Credenciales incorrectas" });
    }
    res.status(500).send({ error: "Error logging in", details: error.message });
  }
});

// --- PROTECTED ROUTE EXAMPLE ---
router.get("/protected", async (req, res) => {
  try {
    console.log('Cookie recibida:', req.headers.cookie);

    const sessionInfo = await axios.get("http://couchdb:5984/_session", {
      headers: { Cookie: req.headers.cookie || "" }
    });
    console.log('Respuesta de CouchDB /_session:', sessionInfo.data);

    if (sessionInfo.data.userCtx && sessionInfo.data.userCtx.name) {
      res.status(200).send({ message: "Access granted", user: sessionInfo.data.userCtx });
    } else {
      res.status(401).send({ error: "Invalid session" });
    }
  } catch (error) {
    console.error("Error validating session:", error.response?.data || error.message);
    res.status(500).send({ error: "Error validating session", details: error.message });
  }
});

// --- LOGOUT ROUTE ---
router.post("/logout", async (req, res) => {
  try {
    // Invalidate the session on CouchDB, passing the client's cookie
    await nanoAuth.request({
      method: "DELETE",
      db: "_session",
      headers: { Cookie: req.headers.cookie || "" },
    });
    // Clear the AuthSession cookie on the client
    res.clearCookie("AuthSession", { path: "/" });
    res.status(200).send({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res
      .status(500)
      .send({ error: "Error logging out", details: error.message });
  }
});

module.exports = router;
