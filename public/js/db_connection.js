const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve("public/db", "clicker.db");

let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message, dbPath);
    return;
  }
  console.log("Connected to the clicker database.");
});

module.exports = db;
