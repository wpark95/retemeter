const korDeviceType = (line) => {
	let savedDate = line.split(' : ')[1];

	if (savedDate.charAt(4) == '-') {
		return 'windows';
	}
	if (savedDate.charAt(4) == '.') {
		return 'iphone';
	}
	if (savedDate.charAt(4) == '년') {
		return 'android';
	}
}

module.exports = { korDeviceType };