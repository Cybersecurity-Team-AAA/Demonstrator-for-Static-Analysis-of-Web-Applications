export function getAllTransactions() {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/getAll`, {
        method: "GET",
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function generateTransactionsFile() {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/generateTransactionsFile`, {
        method: "GET",
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function getTransactionsFile() {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/transactionsFile`, {
        method: "GET",
        credentials: 'include',
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function getOwnTransactions() {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/getOwn`, {
        method: "GET",
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                res.json().then((jsonbody) => {
                    resolve(jsonbody)
                }).catch((err) => {
                    reject(err)
                })
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function getAllClosedTransactionsSeller() {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/getAllSellerClosed`, {
        method: "GET",
        credentials: 'include'
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function requestPayment(usernameBuyer, amount) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/requestPayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({usernameBuyer, amount}),
        credentials: 'include'
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function rechargeWallet(rechargeData) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/rechargeWallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({rechargeData}),
        credentials: 'include'
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function deleteTransaction(transactionId) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({transactionId}),
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function addTransaction(seller, user, amount) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({seller, user, amount}),
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function modifyTransaction(transactionId, amount) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({transactionId, amount}),
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function deleteUserTransaction(transactionId) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/${transactionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function acceptUserTransaction(transactionId) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/transactions/${transactionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                res.json().then((jsonbody) => {
                    resolve(jsonbody)
                }).catch((err) => {
                    reject(err)
                })
            }
            else {
                res.json().then((jsonbody) => {
                    reject(jsonbody)
                }).catch((err) => {
                    reject(err)
                })
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function searchSellerByUsername(sellerUsername) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/users/search/seller/?` + new URLSearchParams({"sellerUsernameToSearch": sellerUsername}), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      })
        .then((res) => {
            if (res.status === 200) {
                res.json().then((jsonbody) => {
                    resolve(jsonbody)
                }).catch((err) => {
                    reject(err)
                })
            }
            else {
                res.json().then((jsonbody) => {
                    reject(jsonbody)
                }).catch((err) => {
                    reject(err)
                })
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}