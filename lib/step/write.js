const fs     = require('fs');
const mkdirp = require('mkdirp');

module.exports = (parameters, stream) => {
  mkdirp.sync(parameters.targetDirectory, 0751);

  let writeStream = fs.createWriteStream(parameters.target);

  stream.pipe(writeStream);

  return writeStream;
};
