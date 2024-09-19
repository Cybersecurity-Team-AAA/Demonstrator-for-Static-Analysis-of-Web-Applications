"use strict";

const sqlite = require('sqlite3');

const db = new sqlite.Database("./src/db/database.sqlite");

module.exports = db;