"use strict";

const express = require("express");
const session = require("express-session");
const fs = require("fs");
const https = require("https");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const authentication = require("./routes/authentication.js");
const transactions = require("./routes/transactions.js");
const users = require("./routes/users.js");
const winston = require("winston");
winston.add(new winston.transports.Console());
winston.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
winston.add(new winston.transports.File({ filename: 'combined.log' }));
const app = express();
const port = process.env.PORT;

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "../../secret/localhost-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../../secret/localhost.pem")),
};

const corsOptions = {
    // origin: ["http://frontend.example.com","http://malware.example2.com","http://malware.test.example.com","http://malware.example.com"],  
    origin: ["http://localhost:3000"],  
    // origin: true,
    credentials: true
};

var cookies = require("cookie-parser");
const server = https.createServer(httpsOptions, app);
app.use(cookies());
app.use(cors(corsOptions));

const bodyParser = require('body-parser');

// to use safe http headers we can use helmet
const helmet = require('helmet')
app.use(helmet())

// this is needed to be able to parse xml for the seller registration
app.use(bodyParser.text({ type: 'application/xml'}));

app.use(express.json({limit: '50mb'}));

app.use(
    session({
        secret: process.env.SESSION_SECRET, // this is inside .env file
        saveUninitialized: true,
        resave: true,
        cookie: {
            name: "cookie",
            httpOnly: true,
            secure: true,
            domain: "localhost", 
            path: "/", 
            maxAge: 90000000,
            expires: new Date().getTime() + 90000000,
            sameSite: "strict"
        }
    })
);

app.use("/authentication", authentication);
app.use("/transactions", transactions);
app.use("/users", users);


// these 3 app configs are for reducing server fingerprint
app.disable('x-powered-by') // we want to avoid that it's sent that the server is 'express'
app.use((req, res, next) => {   // if no other middleware was invoked that means resource was not found so it will enter here
    res.status(404).send("Sorry can't find that!")  // custom 404
})
app.use((err, req, res, next) => {  // if an internal non catched error happens, it will arrive here
    console.error(err.stack)
    res.status(500).send('Something broke!') // custom error handler
})

server.listen(port, () => {
    winston.info(`Server listening on port ${port}`);
});
