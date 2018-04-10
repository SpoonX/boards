const fixFormatting = require('prettier-eslint');
const path          = require('path');
const fs            = require('fs');

module.exports = ({ targetDirectory, targetFile, format }, stream) => {
  if (!format) {
    return Promise.resolve(stream);
  }

  return new Promise((resolve, reject) => {
    const filePath = path.join(targetDirectory, targetFile);

    fs.writeFile(filePath, fixFormatting({ filePath }), error => {
      if (error) {
        return reject(error);
      }

      return resolve(stream);
    });
  })
};
