// ***** Dependencies *****
const express = require('express');
const path = require('path');
const busboy = require('busboy');
const fs = require('fs');
const readline = require('readline');
const frequency = require('./analytics/frequency.js');
const mecab = require('mecab-ya');

// Device Type Checker
const deviceKor = require('./device_type/korean.js');

// Line Sanity & Sanitze
const androidModule = require('./line_sanity/android.js');
const iphoneModule = require('./line_sanity/iphone.js');

const DIST_DIR = path.join(__dirname, '..', 'client', 'dist');
const indexHTML = path.join(__dirname, '..', 'client', 'dist', 'index.html');

// ***** Express *****
const app = express();

app.use(express.static(DIST_DIR));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

app.get('*', (req, res) => {
  res.sendFile(indexHTML, (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.post('/api/test', async (req, res, next) => {
  let userLang, timeStampMap = {}, userMap = {}, messageMap = {};
  const bb = busboy({ 
    headers: req.headers, 
    limits: { 
      files: 1, 
      fileSize: 10485760 } // Max file size: 10MB
    }); 

  bb.on('field', (fieldname, val) => {
    if (fieldname == 'userLanguage') {
      userLang = val;
    } else {
      throw 'userLanguageException';
    }
  });

  bb.on('file', (name, file, info) => {
    const saveTo = path.join(DIST_DIR, '/uploads/' + name + '.csv'); // @@@TO DO@@@: Switch to S3 in Prod
  
    // If .csv file, create a write stream and save
    if (info.mimeType == 'text/csv') {
      file.pipe(fs.createWriteStream(saveTo));
    }

    // If .txt file, covert to .csv and then save
    if (info.mimeType == 'text/plain') {
      const rl = readline.createInterface({ input: file });
      const writeStream = fs.createWriteStream(saveTo);
      let lineDataArr, deviceType, deviceModule, previousLine, lineCount = 1, lineReady = false;
      
      // Write CSV headers
      writeStream.write('Date,User,Message\n');

      rl.on('line', (line) => {
        if (lineCount < 5) {
          lineCount++;
        }

        if (lineCount == 3) {
          // Decide whether Windows, iPhone, or Android
          // Then use the correct language's device type module
          if (userLang == 'kor') {
            deviceType = deviceKor.korDeviceType(line);
            if (deviceType == 'android') {
              deviceModule = androidModule;
            }
            if (deviceType == 'iphone') {
              deviceModule = iphoneModule;
            }
          }
          if (userLang == 'eng') {
            console.log('English version needs to be implemented');
          }
        }

        if (lineCount > 4) {
          // Android & iPhone Module
          lineReady = deviceModule.lineSanityChecker(userLang, line);

          if (!lineReady) {
            previousLine += (' ' + line);
          }
          if (lineReady) {
            lineDataArr = deviceModule.sanitizePrevLine(writeStream, previousLine);
            if (lineDataArr) {
              timeStampMap = frequency.mapTimeFrequency(timeStampMap, lineDataArr[0]);
              userMap = frequency.mapFrequency(userMap, lineDataArr[1]);
            }
            previousLine = line;
          }

          // Windows
          if (deviceType == 'windows') {
            console.log('Windows module needed');
          }
        }
      });

      // Write the last line to CSV
      rl.on('finish', () => {
        // Korean
        if (userLang == 'kor') {
          lineDataArr = deviceModule.sanitizePrevLine(writeStream, previousLine);
          if (lineDataArr) {
            timeStampMap = frequency.mapTimeFrequency(timeStampMap, lineDataArr[0]);
            userMap = frequency.mapFrequency(userMap, lineDataArr[1]);
          }
        }
      })
    }
  });
  

  bb.on('finish', () => {
    console.log(userMap);

    res.send([timeStampMap, userMap]);
  });
  return req.pipe(bb);
});

module.exports = app;