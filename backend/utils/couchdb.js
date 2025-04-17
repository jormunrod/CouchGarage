const nano = require('nano');
require('dotenv').config();

const couchdb = nano({
  url: process.env.COUCHDB_URL,
  requestDefaults: {
    auth: {
      user: process.env.COUCHDB_USER,
      pass: process.env.COUCHDB_PASSWORD,
    },
  },
});

const database = couchdb.use(process.env.COUCHDB_DATABASE);

module.exports = database;