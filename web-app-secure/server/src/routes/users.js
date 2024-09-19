"use strict";

const express = require("express");
const router = express.Router();
const dbapi = require("../db/api");

router.get("/pendingRegistration", function (req, res) { 
    if (req.session.user !== undefined && req.session.user.role === "admin") {
        dbapi.getPendingUsers()
        .then((response) => {
            res.status(200).send(JSON.stringify(response));
        })
        .catch(() => {
            res.status(500).send();
        });
    }
    else {
        res.status(401).send();
    }
});

router.post("/approveRegistration", function (req, res) { 
    if (req.session.user !== undefined && req.session.user.role === "admin") {
        dbapi.approveRegistration(req.body.sellerId)
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
        dbapi.deleteUser(req.body.userId)
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

router.post("/role", function (req, res) { 
    if (req.session.user !== undefined && req.session.user.role === "admin") {
        dbapi.getRole(req.body.userId)
        .then((row) => {
            res.status(200).send(JSON.stringify(row));
        })
        .catch(() => {
            res.status(500).send();
        });
    }
    else {
        res.status(401).send();
    }
});

router.get("/search/seller", function(req, res){
    if ((req.session.user !== undefined && req.session.user.role === "user")) {  
        let finalRegex=""
        if(req.query.sellerUsernameToSearch.includes("+")){
            // const { VM } = require('vm2');
            // const vm = new VM({
            //     sandbox: {}
            //   });
            // const inputRegex = req.query.sellerUsernameToSearch;    // this will be the regex to execute
            // finalRegex = vm.run(inputRegex);  // safe way to execute eval to get the full regex with concatenated regex string (but it's not enough bc we sill be vuln to braces vulnerability....)
            
            const ivm = require('isolated-vm');
            const isolate = new ivm.Isolate({ memoryLimit: 128 });
            const context = isolate.createContextSync();
            const scriptCode = req.query.sellerUsernameToSearch; // this will be the regex to execute
            const script = isolate.compileScriptSync(`${scriptCode}`);
            finalRegex = script.runSync(context);   // safe way to execute eval to get the full regex with concatenated regex string (but it's not enough bc we sill be vuln to braces vulnerability....)
            finalRegex = finalRegex.toString();
        }
        else{
            finalRegex = req.query.sellerUsernameToSearch
        }

        const { braces } = require('micromatch');
        const finalSellerUsernameToSearch = braces(finalRegex, { expand: true });    // oops.... I put this in theroy to be able to search more seller at once, via a regex.... but make sure braces is not vuln!

        dbapi.getSellerByUsername(finalSellerUsernameToSearch)
        .then((row) => {
            res.status(200).send(JSON.stringify(row));
        })
        .catch((err) => {            
            res.status(500).send(JSON.stringify(err));
        });
    }
    else {
        res.status(401).send();
    }
});

module.exports = router;