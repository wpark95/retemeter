const mapFrequency = (map, string) => {
	if (string) {
		if (!map[string]) {
			map[string] = 1;
		} else {
			map[string]++;
		}
	}
	return map;
}

const mapTimeFrequency = (map, string) => {
	if (string) {
		const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
		const spaceRE = /\s+/g;
		const timeRE = /년|월|일/g;
		
		const timeStandardized = string.replace(punctRE, ' ')
									.replace(timeRE, ' ')
									.replace(spaceRE, ' ');

		if (timeStandardized) {
			if (!map[timeStandardized]) {
				map[timeStandardized] = 1;
			} else {
				map[timeStandardized]++;
			}
		}
	}
	return map;
};



module.exports = { mapFrequency, mapTimeFrequency };