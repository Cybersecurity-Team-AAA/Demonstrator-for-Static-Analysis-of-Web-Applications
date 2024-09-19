"use strict";

const express = require("express");
const router = express.Router();
const dbapi = require("../db/api");
const crypto = require("../crypto");
const pt = require("path");
const fs = require("fs");
const winston = require("winston");


router.get("/getAll", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "admin") {
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
        }        
        else {
            res.status(401).send();
        }
});

router.get("/getOwn", function (req, res) {
    winston.info(`User "${req.session.user.username}" fetched its own transactions`);
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

router.post("/requestPayment", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "seller") {
        dbapi.getUserRoleUserByUsername(req.body.usernameBuyer)
            .then((role) => {
                if (role === "user") {
                    dbapi.addTransaction(req.session.user.username, req.body.usernameBuyer, req.body.amount)
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

router.post("/rechargeWallet", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "seller") {
        const rechargeData = crypto.symmetricDecryption(req.body.rechargeData.ciphertext, req.session.user.passwordHash, req.body.rechargeData.iv);
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
    if (req.session.user !== undefined && req.session.user.role === "admin") {  
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
                    const path = pt.join("src/files/" + req.session.user.id);
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
            .catch((err) => {
                res.status(500).send();
            });
    }
    else {
        res.status(401).send();
    }
});

router.get("/transactionsFile", function (req, res) {
    if (req.session.user !== undefined && req.session.user.role === "user") {
        const path = pt.join("src/files/" + req.session.user.id);
        res.download(path);
    }
    else {
        res.status(401).send();
    }
});

module.exports = router;