const fs = require('fs');

module.exports = (parameters, stream) => {
  let writeStream = fs.createWriteStream(parameters.target);

  stream.pipe(writeStream);

  return writeStream;
};
