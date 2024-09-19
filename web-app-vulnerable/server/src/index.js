"use strict";

const express = require("express");
const session = require("express-session");
const serveIndex = require("serve-index")
require("dotenv").config();
const cors = require("cors");
const authentication = require("./routes/authentication.js");
const transactions = require("./routes/transactions.js");
const users = require("./routes/users.js");
const winston = require("winston");
const { format } = require("winston"); // used for logging and log injections
winston.add(new winston.transports.Console({ format: winston.format.simple() }));
winston.add(new winston.transports.File({ filename: 'error.log', level: 'error', format: format.printf(info => info.message) }));
winston.add(new winston.transports.File({ filename: 'combined.log', format: winston.format.simple() }));
const app = express();
const port = process.env.PORT;

const corsOptions = {
    origin: "http://localhost:3000",  
    credentials: true
};
var cookies = require("cookie-parser");

app.use(cookies());
app.use(cors(corsOptions));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: true,
        genid: (req) => {
            // VULN: Session Prediction
            const user_id = req.body.username || `1`;
            return user_id;
        },
        cookie: {
            httpOnly: false,
            secure: false,
            sameSite: "None",
            maxAge: 3600000000
        }
    })
);

app.use("/authentication", authentication);
app.use("/transactions", transactions);
app.use("/users", users);

// Directory listing vulnerability 
app.use('/dir', express.static('./'), serveIndex('./', { 'icons': true }))

// this is needed to be able to parse xml for the seller registration
const bodyParser = require('body-parser');
app.use(bodyParser.text({ type: 'application/xml' }));


app.listen(port, () => {
    winston.info(`Server listening on port ${port}`);
});

