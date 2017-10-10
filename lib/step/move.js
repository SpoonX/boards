const fs = require('fs');

module.exports = ({move} = null, stream) => {
  if (!move) {
    return stream;
  }

  return new Promise((resolve, reject) => {
    fs.rename(move.sourceFile, move.targetFile, error => {
      if (error) {
        return reject(error);
      }

      resolve(stream);
    })
  });
};
