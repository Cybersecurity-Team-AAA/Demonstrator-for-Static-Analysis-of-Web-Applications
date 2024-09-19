const crypto = require("browser-crypto");
const sr = require("secure-random");

export const symmetricEncryption = (plaintext, pwdHash) => {
	const key = pwdHash.substring(0,32)  // Gets the first 32 hexadecimal digits
	const keyHex = crypto.Buffer.from(key, "hex");  // Creates a buffer containing the key
	const iv = sr(16); ;  // Generates the initialization vector
 	const cipher = crypto.createCipheriv("aes-128-ctr", keyHex, iv);
  	let ciphertext = cipher.update(plaintext, "utf-8", "base64");
  	ciphertext += cipher.final("base64");
  	return {"ciphertext":ciphertext, "iv":iv};
}
