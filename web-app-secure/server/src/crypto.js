const crypto = require("crypto");

const getHash = (pwd) => {
    return pwdHash = crypto.createHash("sha256").update(pwd).digest("hex");  // Computes the password hash
}

const symmetricDecryption = (ciphertext, pwdHash, iv) => {
	const key = pwdHash.substring(0,32)  // Gets the first 32 hexadecimal digits
	const keyHex = Buffer.from(key, "hex");  // Creates a buffer containing the key
	const decipher = crypto.createDecipheriv("aes-128-ctr", keyHex, Buffer.from(iv));
	let plaintext = decipher.update(ciphertext, "base64", "utf-8");
	plaintext += decipher.final("utf-8");
	return plaintext;
  }

module.exports = {symmetricDecryption, getHash}
