const crypto = require("crypto");

const addPadding = (plaintext) => { // Add padding to get a plaintext that is a multiple of the block size
	if(plaintext.length % 16 !== 0) {
		for(let i = 0; i < plaintext.length % 16; i++){
			plaintext += "X";
		}
	}
	return plaintext;
}

const removePadding = (plaintext) => {  // Returns the plaintext without padding 
	for(let i = plaintext.length; i > 0; i--){
		if(plaintext[i] === "X"){
			plaintext = plaintext.substring(0,i);
		}
	}
	return plaintext;
}

const getHash = (pwd) => {
    return pwdHash = crypto.createHash("sha256").update(pwd).digest("hex");  // Computes the password hash
}

const symmetricDecryption = (ciphertext, pwdHash) => {
	const key = pwdHash.substring(0,32)  // Gets the first 32 hexadecimal digits
	const keyHex = Buffer.from(key, "hex");  // Creates a buffer containing the key
	const decipher = crypto.createDecipheriv("aes-128-ecb", keyHex, null).setAutoPadding(false);
	let plaintext = decipher.update(ciphertext, "base64", "utf-8");
	plaintext += decipher.final("utf-8");
	return removePadding(plaintext);
  }

module.exports = {symmetricDecryption, getHash}
