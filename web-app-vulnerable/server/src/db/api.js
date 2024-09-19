"use strict";

const winston = require("winston");
const { getHash } = require("../crypto");
const db = require("./db");

exports.getCurrentTime = () => {
	const now = new Date();
	now.setHours(now.getHours() + 1); // Aggiunge un'ora al fuso orario
	const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
	return timestamp;
}


exports.getAllTransactions = (user_id) => {
	return new Promise((resolve, reject) => {
		let query;
		if (user_id)
			query = "SELECT t.id , u.username AS user_username, s.username AS seller_username, t.amount, t.pending_state, t.timestamp FROM transactions t JOIN users u ON t.user_id = u.id JOIN users s ON t.seller_id = s.id WHERE t.user_id = ?";
		else
			query = "SELECT t.id , u.username AS user_username, s.username AS seller_username, t.amount, t.pending_state, t.timestamp FROM transactions t JOIN users u ON t.user_id = u.id JOIN users s ON t.seller_id = s.id";
		db.all(query, user_id ? [user_id] : undefined, (err, rows) => {
			if (err) {
				reject(err);
			}
			else if (rows == undefined) {
				resolve();
			}
			else {
				resolve(rows);
			}
		});
	});
}

exports.getAllClosedTransactionsBySellerId = (sellerId) => {
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM transactions WHERE seller_id = ? AND pending_state = ?';
		db.all(query, [sellerId, "false"], (err, rows) => {
			if (err) {
				reject(err);
			}
			else if (rows == undefined) {
				resolve();
			}
			else {
				resolve(rows);
			}
		});
	});
}

exports.rechargeUserWallet = (username, amount) => {
	return new Promise((resolve, reject) => {
		db.run("PRAGMA foreign_keys=on");
		const query = "UPDATE users SET balance = balance + ? WHERE username = ? and role = ?";
		db.run(query, [amount, username, "user"], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.decreaseUserWallet = (username, amount) => {
	return new Promise((resolve, reject) => {
		db.run("PRAGMA foreign_keys=on");
		const query = "UPDATE users SET balance = balance - ? WHERE username = ? and role = ?";
		db.run(query, [amount, username, "user"], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.deleteTransaction = (transactionId) => {
	return new Promise((resolve, reject) => {
		const query = "DELETE FROM transactions WHERE id = ?";
		db.run(query, [transactionId], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.getTransactionById = (transactionId) => {
	return new Promise((resolve, reject) => {
		const query = "SELECT * FROM transactions WHERE id = ?";
		db.get(query, [transactionId], (err, row) => {
			if (err) {
				reject(err);
			}
			else if (row == undefined) {
				resolve();
			}
			else {
				resolve(row);
			}
		});
	});
}

exports.acceptTransaction = (transactionId) => {
	return new Promise((resolve, reject) => {
		const query = "UPDATE transactions SET pending_state = ? WHERE id = ?";
		db.run("PRAGMA foreign_keys=on");
		db.run(query, ["false", transactionId], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.deleteUser = (userId) => {
	return new Promise((resolve, reject) => {
		const query = "DELETE FROM users WHERE id = ?";
		db.run(query, [userId], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.addTransaction = (seller, user, amount) => {
	return new Promise((resolve, reject) => {
		this.getUserByUsername(seller)
			.then((usrSeller) => {
				this.getUserByUsername(user)
					.then((usrUser) => {
						const timestamp = this.getCurrentTime();
						const query = "INSERT INTO transactions(user_id, seller_id, amount, pending_state, timestamp) VALUES (?, ?, ?, ?, ?)";
						db.run("PRAGMA foreign_keys=on");
						db.run(query, [usrUser.id, usrSeller.id, amount, "true", timestamp], (err) => {
							if (err) {
								reject(err);
							}
							else {
								resolve();
							}
						});
					})
					.catch((err) => {
						reject(err);
					})
			})
			.catch((err) => {
				reject(err);
			});
	});
}

exports.modifyTransaction = (transactionId, amount) => {
	return new Promise((resolve, reject) => {
		const query = "UPDATE transactions SET amount = ? WHERE id = ?";
		db.run("PRAGMA foreign_keys=on");
		db.run(query, [amount, transactionId], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.getUserByUsername = (username) => {
	return new Promise((resolve, reject) => {
		const query = "SELECT * FROM users WHERE username = ?";
		db.get(query, [username], (err, row) => {
			if (err) {
				reject(err);
			}
			else if (row === undefined) {
				resolve();
			}
			else {
				const user = {
					id: row.id,
					username: row.username,
					role: row.role,
				};
				resolve(user);
			}
		});
	});
}

// SQL-Injection vuln
// For example
// %22%20UNION%20SELECT%20id%2C%20username%2C%20password%20FROM%20users%20WHERE%20%221%22%3D%221%22%20--
// This equals to this
// " UNION SELECT id, username, password FROM users WHERE "1"="1" --
// Which allows us to leak the password, same logic can be applied to other fields
exports.getSellerByUsername = (usernamesToSearch) => {
	return new Promise((resolve, reject) => {
		const likeConditions = usernamesToSearch.map(pattern => `username LIKE "%${pattern}%"`).join(" OR ");

		const query = `SELECT id, username, address FROM users WHERE role = "seller" and ${likeConditions}`;
		winston.debug("getSellerByUsername query", { query })
		db.all(query, [], (err, rows) => {
			if (err) {
				reject(err);
			}
			else if (rows === undefined) {
				resolve([]);
			}
			else {
				resolve(rows);
			}
		});
	});
}

exports.getUserRoleUserByUsername = (username) => {
	return new Promise((resolve, reject) => {
		const query = "SELECT role FROM users WHERE username = ?";
		db.get(query, [username], (err, row) => {
			if (err) {
				reject(err);
			}
			else if (row === undefined) {
				resolve();
			}
			else {
				resolve(row.role);
			}
		});
	});
}

exports.getUserById = (id) => {
	return new Promise((resolve, reject) => {
		const query = "SELECT * FROM users WHERE id = ?";
		db.get(query, [id], (err, row) => {
			if (err) {
				reject(err);
			}
			else if (row === undefined) {
				resolve();
			}
			else {
				const user = {
					id: row.id,
					username: row.username,
					role: row.role,
				};
				resolve(user);
			}
		});
	});
}

exports.getPendingUsers = () => {
	return new Promise((resolve, reject) => {
		const query = "SELECT id, username, document, filename, webpage, address FROM users WHERE pending_registration = ?";
		db.all(query, ["true"], (err, rows) => {
			if (err) {
				reject(err);
			}
			else if (rows === undefined) {
				resolve();
			}
			else {
				resolve(rows);
			}
		});
	});
}

exports.approveRegistration = (sellerId) => {
	return new Promise((resolve, reject) => {
		const query = "UPDATE users SET pending_registration = ? WHERE id = ?";
		db.all(query, ["false", sellerId], (err, rows) => {
			if (err) {
				reject(err);
			}
			else if (rows === undefined) {
				resolve();
			}
			else {
				resolve(rows);
			}
		});
	});
}

exports.checkCredentials = (username, password) => {
	return new Promise((resolve, reject) => {
		const query = "SELECT * FROM users WHERE username = ? and password = ?";
		db.get(query, [username, password], (err, row) => {
			if (err) {
				reject(err);
			}
			else if (row === undefined) {
				reject();
			}
			else {
				resolve({
					"id": row.id,
					"username": row.username,
					"passwordHash": getHash(row.password),
					"balance": row.balance,
					"role": row.role,
					"pending_registration": row.pending_registration
				});
			}
		});
	});
}

exports.addUser = (username, password, role, pending_registration) => {
	return new Promise((resolve, reject) => {
		const query = "INSERT INTO users (username, password, role, balance, pending_registration) VALUES(?, ?, ?, ?, ?)";
		db.run(query, [username, password, role, 0, pending_registration], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.addSeller = (username, password, address, role, pending_registration, webpage, filename, proofSeller) => {
	return new Promise((resolve, reject) => {
		const query = "INSERT INTO users (username, password, role, balance, pending_registration, address, webpage, filename, document) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
		db.run(query, [username, password, role, 0, pending_registration, address, webpage, filename, proofSeller], (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

exports.updateUser = (id, username, newPassword = null) => {
	return new Promise((resolve, reject) => {
		if (!newPassword) {
			winston.info("Updating only username of user with id", id, "to", username);
			const query = "UPDATE users SET username = ? WHERE id = ?";
			db.run(query, [username, id], (err) => {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
			return;
		}
		else {
			winston.info("Updating user with id", id, "to", {username, newPassword});
			const query = "UPDATE users SET username = ?, password = ? WHERE id = ?";
			db.run(query, [username, newPassword, id], (err) => {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		}

	});
}

// const fs = require('fs').promises;
// exports.downloadDocument = (username) => {	// this function can be used to download the pdf (inside db) to disk
// 	return new Promise((resolve, reject) => {
//         db.get("SELECT document FROM users WHERE username = ?", [username], async (err, row) => {
//             if (err) {
//                 reject(err);
//             }
//             if (!row || !row.document) {
//                 reject();
//             }
//             const documentBuffer = Buffer.from(row.document, 'binary');
//             try {
//                 await fs.writeFile(`documento_${username}.pdf`, documentBuffer);
//                 resolve();
//             } catch (err) {
//                 reject(err);
//             }
//         });
//     });
// }