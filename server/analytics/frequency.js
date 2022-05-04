const mapFrequency = (map, message) => {
	const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
	const spaceRE = /\s+/g;

	const words = message.replace(punctRE, ' ')
								.replace(spaceRE, ' ')
								.split(' ');

	for(let word of words) {
		if(!map[word]) {
			map[word] = 1;
		} else {
			map[word]++;
		}
	}
};

// 	// O(n log n) where n is number of words

// 	let sorted = Object.keys(map).sort((a,b) => {
// 		if(map[a] == map[b]) {
// 			return a > b ? 1 : -1;
// 		} else {
// 			return map[b] - map[a];
// 		}
// 	})

// 	return sorted.slice(0, k); 	
// };

module.exports = { mapFrequency };