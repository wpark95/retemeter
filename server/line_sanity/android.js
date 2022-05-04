const lineSanityChecker = (language, line) => {
	// Return false for empty lines
	if (!line) {
		return false;
	}

	// If the user language is Korean, check for sanity
	if (language == 'kor') {
		let lineArr = line.split(' ');

		// If the line array's size is smaller than 5, return false
		if (lineArr.length < 5) {
			return false;
		}
		if (lineArr[0].slice(-1) == '년' && 
				lineArr[1].slice(-1) == '월' &&
			  lineArr[2].slice(-1) == '일' && 
				(lineArr[3] == '오전' || lineArr[3] == '오후') && 
				lineArr[4].indexOf(':') !== -1) {
			return true;
		} else {
			return false;
		}
	}
}

const sanitizePrevLine = (writeStream, previousLine) => {
	let lineArr = previousLine.split(' ');
  let username = '';
  let message = '';

	if (lineArr[5] && previousLine) {
		let findUsername = true;

		for (i = 5; i < lineArr.length; i++) {
			if (lineArr[i] == ':') {
				findUsername = false;
			} else {
				if (findUsername) {
					username += lineArr[i] + ' ';
				}
				if (!findUsername) {
					message += lineArr[i] + ' ';
				}
			}
		}
	}
	if (username && message) {
		let timeStamp = lineArr[0] + ' ' + lineArr[1] + ' ' + 
				lineArr[2] + ' ' + lineArr[3] + ' ' + lineArr[4].replace(',', '');
		writeStream.write(`"${timeStamp}","${username}","${message.replace(/"/g, '""')}"\n`);
	}
}

module.exports = { lineSanityChecker, sanitizePrevLine };