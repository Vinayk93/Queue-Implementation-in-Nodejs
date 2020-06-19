
const fs = require('fs');
const { Signer } = require('crypto');
// const readline = require('readline');
const LOG_FILE_PATH_local = process.env.LOG_FILE_PATH_local;
const SIZE_LIMIT = process.env.SIZE_LIMIT;

function read_file (line, LOG_FILE_PATH) {
  if (LOG_FILE_PATH === undefined) {
    LOG_FILE_PATH = LOG_FILE_PATH_local;
  }
  return new Promise((resolve, reject) => {
    const start = (line-1)*SIZE_LIMIT;
    const end = line*SIZE_LIMIT;
    const readStream = fs.createReadStream(LOG_FILE_PATH, {
      start: start,
      end: end
    });
    readStream.on('end', () => {
      resolve({'end': true});
    });
    readStream.on('data', (data) => {
      // console.log(data.toString());
      data = data.toString();
      try {
        const parsedata = JSON.parse(data);
        resolve(parsedata);
      } catch (e) {
        // console.log(e);
      }
    });
  });
};

function write_file (content, LOG_FILE_PATH) {
  if (LOG_FILE_PATH === undefined) {
    LOG_FILE_PATH = LOG_FILE_PATH_local;
  }
  // console.log('write_the_file');
  return new Promise((resolve, reject) => {
    const blank_space = ' '.repeat(SIZE_LIMIT);
    let newcontent = '';
    if (content.length > SIZE_LIMIT) {
      reject(new Error('Cannot write more than 100 words'));
    } else {
      newcontent = content.concat(blank_space);
      newcontent.substring(0, SIZE_LIMIT);
    }
    newcontent += '\n';
    fs.appendFile(LOG_FILE_PATH, newcontent, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

module.exports.read_file = read_file;
module.exports.write_file = write_file;
// unit test
// const sample_input = {
//   'a': 2,
//   'retry': 's',
//   'payload': {
//     's': 2
//   }
// };
// write_file(JSON.stringify(sample_input));
// read_file(2).then(r => {
//   console.log(r);
// });
