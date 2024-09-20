"use strict";

const sqlite = require('sqlite3');

const db = new sqlite.Database("./src/db/database.sqlite");

// db.on('trace', (sql) => {
//     console.log(`SQL executed: ${sql}`);
//   });

module.exports = db;