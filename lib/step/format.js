const fixFormatting = require('prettier-eslint');
const path          = require('path');
const fs            = require('fs');

module.exports = ({ sourceDirectory, sourceFile, format }, stream) => {
  const filePath = path.join(sourceDirectory, sourceFile);

  if (!format) {
    return Promise.resolve(stream);
  }

  try {
    fs.writeFileSync(filePath, fixFormatting({ filePath }));

    return Promise.resolve(stream);
  } catch (error) {
    return Promise.reject(error);
  }
};
