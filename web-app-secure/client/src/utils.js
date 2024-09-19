export const fromCharArrayToBase64 = (pdfBufferData) =>{    // from an array of chars (decimal value) it converts them to a base64 string
	let binaryString = '';
	const bytes = new Uint8Array(pdfBufferData);
	for (let i = 0; i < bytes.byteLength; i++) {
		binaryString += String.fromCharCode(bytes[i]);
	}
	const base64PDF = btoa(binaryString);   // this is to convert the char string to base64 string
	return base64PDF;
}