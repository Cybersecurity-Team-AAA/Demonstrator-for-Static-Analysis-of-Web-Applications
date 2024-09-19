"use strict";

const express = require("express");
const router = express.Router();
const dbapi = require("../db/api");
const winston = require("winston");

// Improper control of interaction frequency vulnerability
router.post("/login", function (req, res) {
    dbapi.checkCredentials(req.body.username, req.body.password)
        .then((result) => { // result contains "id", "username", "passwordHash", "balance", "role", "pending_registration"
            if (result.pending_registration === "false") {
                req.session.user = result; // express has session module that automatically matches the request with a session object of the active sessions. this way I can access and edit the object directly. for example in this case I'm saving a user object so I can track the role of all the next incoming requests. By the way, Express sessions basically work like this: when you log in, it stores the session using `req.session` with a `connect.sid` cookie. So, essentially, if I were to steal the cookie using `document.cookie`, it would only work if the person is still logged in. If they've logged out, Express will remove the session from its database, meaning that even if I, as an attacker, tried to use the stolen `connect.sid`, it wouldn't work because Express wouldn't recognize it anymore.
                res.status(200)
                    .cookie("passwordHash", result.passwordHash)    // this is a cookie used for stuff like recharge wallet.... but the "normal" and "real" cookie is automatically sent by express and it's called connect.sid
                    .cookie("username", req.body.username, { httpOnly: false }) // also we send username cookie for the Repudiation Attack (used in log on getOwn transactions)
                    .send(JSON.stringify(result));  // we send 'result' which contains: "id", "username", "passwordHash", "balance", "role", "pending_registration". even though they are NOT all needed but who cares... this will be saved in localstorage to persist session across refresh etc... this is just needed in order for frontend to display proper things. but it's not a security thing, since the methods are blocked in backend according to role inside session object.
                    // so we also sent the "real" cookie connect.sid implicitly
                winston.info(`login success by ${req.body.username}`);
            }
            else {       // otherwise:
                res.status(401).send();
                winston.info(`login failed by ${req.body.username}`);
            }
        })
        .catch(() => {
            winston.info(`login failed by ${req.body.username}`);
            res.status(500).send();
        })
});

router.get("/logout", function (req, res) {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send();
            }
            else {
                res.clearCookie("connect.sid").clearCookie("passwordHash").status(200).send();
            }
        })
    }
});

const fetchPDF = (documentLink) => {
    return new Promise((resolve, reject) => {
        fetch(documentLink)
            .then(response => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.arrayBuffer();
            })
            .then(pdfBuffer => {
                const docBuffer = Buffer.from(pdfBuffer);
                resolve(docBuffer);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Injection and error revealing vulnerabilities
const validateCredentials = (username, password) => {
    const passwordRegex = new RegExp("^(([a-zA-Z])+.)+([a-zA-Z])+$");
    // Example of eval injection: '; dbapi.deleteUser(4) || 'aaa        
    // Example of regex injection: tttttttttttttttttttttttttttttttttttttttttttttttttt+
    return eval(`'${username}'.length > 3`) && passwordRegex.test(password);
}

router.post("/registration", function (req, res) {
    try {
        if(!validateCredentials(req.body.username, req.body.password)) 
            res.status(500).send();
    }
    catch (err) {
        // Example of input which reveals useful information: '; adwadawd || 'aaaafawfawf
        winston.error("Error during registration", err);
        res.status(500).send(err.stack);
        return;
    }

    if (req.body.role === "seller") {
        if (req.body.sellerPDFUrl) {
            fetchPDF(req.body.sellerPDFUrl)
                .then(pdfBuffer => {
                    dbapi.addSeller(req.body.username, req.body.password, req.body.address, "seller", "true", req.body.webpage, req.body.filename, pdfBuffer)
                        .then(() => {
                            //dbapi.downloadDocument(req.body.username)
                            res.status(201).send(JSON.stringify({ "pdfBuffer": pdfBuffer, "filename": req.body.filename }));  // oops
                        })
                })
                .catch(() => {
                    res.status(500).send();
                });
        } else if (req.body.xmlContent) {
            try {
                const xml = req.body.xmlContent;
                const libxmljs = require('libxmljs');
                const doc = libxmljs.parseXml(xml, { replaceEntities: true, dtdload: true });
                const sellerName = doc.get('//seller/name').text();
                dbapi.addSeller(req.body.username, req.body.password, req.body.address, "seller", "true", req.body.webpage, req.body.filename, req.body.xmlContent)
                    .then(() => {
                        res.status(201).send(JSON.stringify({ "sellerName": sellerName }));  // oops
                    })
            } catch {
                console.log("fail in xml processing, maybe seller tag or name tag is missing")
                res.status(500).send();
            }

        }
    } else {   // if it's a normal user        
        dbapi.addUser(req.body.username, req.body.password, req.body.role, "false")
            .then(() => {
                res.status(201).send();
            })
            .catch(() => {
                res.status(500).send();
            });
    }
});

router.get("/user/:id", function (req, res) {
    // user data from id
    dbapi.getUserById(req.params.id).then((user) => {
        if (user) {
            res.status(200).send(JSON.stringify({ id: user.id, username: user.username, role: user.role, balance: user.balance }));
        }
        else {
            res.status(404).send();
        }
    }).catch(() => {
        res.status(500).send();
    });
})

router.put("/user/:id", async function (req, res) {
    // update user data
    // username and optionally update password
    // values: {username: "newUsername", password: "newPassword", currentPassword: "currentPassword"}
    if (!req.body.username) {
        winston.warn("missing fields on user update", { body: req.body });
        return res.status(400).send();
    }

    try {
        await dbapi.updateUser(req.params.id, req.body.username, req.body.password)
        res.status(200).send();
    } catch (err) {
        res.status(500).send();
    }
});

module.exports = router;