const fs     = require('fs');
const mkdirp = require('mkdirp');

module.exports = (parameters, stream) => {
  mkdirp.sync(parameters.targetDirectory, parseInt('0751', 8));

  let writeStream = fs.createWriteStream(parameters.target);

  stream.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('error', reject);
    writeStream.on('close', () => resolve(writeStream));
  });
};
