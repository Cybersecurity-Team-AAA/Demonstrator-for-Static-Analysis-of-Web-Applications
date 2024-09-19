const crypto = require("browser-crypto");

const addPadding = (plaintext) => { // Add padding to get a plaintext that is a multiple of the block size
	if(plaintext.length % 16 !== 0) {
		for(let i = 0; i < plaintext.length % 16; i++){
			plaintext += "X";
		}
	}
	return plaintext;
}

// const removePadding = (plaintext) => {  // Returns the plaintext without padding 
// 	for(let i = plaintext.length; i > 0; i--){
// 		if(plaintext[i] === "X"){
// 			plaintext = plaintext.substring(0,i);
// 		}
// 	}
// 	return plaintext;
// }

export const symmetricEncryption = (plaintext, pwdHash) => {
	const key = pwdHash.substring(0,32)  // Gets the first 32 hexadecimal digits
	const keyHex = crypto.Buffer.from(key, "hex");  // Creates a buffer containing the key
 	const cipher = crypto.createCipheriv("aes-128-ecb", keyHex, "").setAutoPadding(false);
  	let ciphertext = cipher.update(addPadding(plaintext), "utf-8", "base64");
  	ciphertext += cipher.final("base64");
  	return ciphertext;
}
