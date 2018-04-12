const fixFormatting = require('prettier-eslint');
const path          = require('path');
const fs            = require('fs');

module.exports = ({ targetDirectory, targetFile, target, format, _boards, sourceDirectory, sourceFile }, stream) => {
  if (!format) {
    return Promise.resolve(stream);
  }

  return new Promise((resolve, reject) => {
    // _boards.finalTarget === 'source'
    const filePath = _boards.finalTarget === 'source'
      ? path.join(sourceDirectory, sourceFile)
      : path.join(targetDirectory, targetFile);

    fs.writeFile(filePath, fixFormatting({ filePath }), error => {
      if (error) {
        return reject(error);
      }

      return resolve(stream);
    });
  })
};
