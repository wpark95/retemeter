// ***** Dependencies *****
const express = require("express");
const path = require("path");
const busboy = require("busboy");
const fs = require("fs");
const readline = require("readline");
const frequency = require("./analytics/frequency.js");
const mecab = require("mecab-ya");

// Device Type Checker
const deviceKor = require("./device_type/korean.js");

// Line Sanity & Sanitze
const androidModule = require("./line_sanity/android");
const iphoneModule = require("./line_sanity/iphone");

// Constants
const DIST_DIR = path.join(__dirname, "..", "client", "dist");
const INDEX_HTML = path.join(__dirname, "..", "client", "dist", "index.html");
const MAX_FILE_SIZE = 10485760; // 10 MB

const convertTxtToCsv = (
	fileSaveDestination,
	file,
	userLang,
	timeStampMap,
	userMap,
	messageMap
) => {
	const rl = readline.createInterface({ input: file });
	const writeStream = fs.createWriteStream(fileSaveDestination);
	let lineDataArr,
		deviceType,
		deviceModule,
		previousLine,
		lineCount = 1,
		lineReady = false;

	// Write CSV headers
	writeStream.write("Date,User,Message\n");

	rl.on("line", (line) => {
		if (lineCount < 5) {
			lineCount++;
		}

		if (lineCount == 3) {
			// Decide whether Windows, iPhone, or Android
			// Then use the correct language's device type module
			if (userLang == "KOR") {
				deviceType = deviceKor.korDeviceType(line);
				if (deviceType == "android") {
					deviceModule = androidModule;
				}
				if (deviceType == "iphone") {
					deviceModule = iphoneModule;
				}
			}
			if (userLang == "ENG") {
				console.log("English version needs to be implemented");
			}
		}

		if (lineCount > 4) {
			// Android & iPhone Module
			lineReady = deviceModule.lineSanityChecker(userLang, line);

			if (!lineReady) {
				previousLine += " " + line;
			}
			if (lineReady) {
				lineDataArr = deviceModule.sanitizePrevLine(writeStream, previousLine);
				if (lineDataArr) {
					timeStampMap = frequency.mapTimeFrequency(
						timeStampMap,
						lineDataArr[0]
					);
					userMap = frequency.mapFrequency(userMap, lineDataArr[1]);
				}
				previousLine = line;
			}

			// Windows
			if (deviceType == "windows") {
				console.log("Windows module needed");
			}
		}
	});

	// Write the last line to CSV
	rl.on("finish", () => {
		// Korean
		if (userLang == "KOR") {
			lineDataArr = deviceModule.sanitizePrevLine(writeStream, previousLine);
			if (lineDataArr) {
				timeStampMap = frequency.mapTimeFrequency(timeStampMap, lineDataArr[0]);
				userMap = frequency.mapFrequency(userMap, lineDataArr[1]);
			}
		}
	});
};

// ***** Express *****
const app = express();

app.use(express.static(DIST_DIR));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

app.get("*", (req, res) => {
	res.sendFile(INDEX_HTML, (err) => {
		if (err) {
			res.status(500).send(err);
		}
	});
});

app.post("/api/test", async (req, res, next) => {
	let userLang,
		timeStampMap = {},
		userMap = {},
		messageMap = {};
	const bb = busboy({
		headers: req.headers,
		limits: {
			files: 1,
			fileSize: MAX_FILE_SIZE,
		},
	});

	bb.on("field", (fieldname, val) => {
		if (fieldname === "userLanguage") {
			userLang = val;
		} else {
			throw "userLanguageException";
		}
	});

	bb.on("file", (name, file, info) => {
		const fileSaveDestination = path.join(
			DIST_DIR,
			"/uploads/" + name + ".csv"
		); //TODO: Switch to S3 in Prod

		// If .csv file, create a write stream and save
		if (info.mimeType == "text/csv") {
			file.pipe(fs.createWriteStream(fileSaveDestination));
		}

		// If .txt file, covert to .csv and then save
		if (info.mimeType == "text/plain") {
			convertTxtToCsv(
				fileSaveDestination,
				file,
				userLang,
				timeStampMap,
				userMap,
				messageMap
			);
		}
	});

	bb.on("finish", () => {
		console.log(userMap);

		res.send([timeStampMap, userMap]);
	});
	return req.pipe(bb);
});

module.exports = app;
