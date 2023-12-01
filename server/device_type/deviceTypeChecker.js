const { SUPPORTED_DEVICE_TYPES, SUPPORTED_LANGUAGES } = require('./common');

const getDeviceType = (userLang, line) => {
	switch (userLang) {
		case SUPPORTED_LANGUAGES.KOREAN:
			return deviceTypeKor(line)

		default:
			throw new Error('Unsupported language was detected')
	}
};

const deviceTypeKor = (line) => {
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

module.exports = { getDeviceType };