const fs      = require('fs');
const request = require('request');

module.exports = parameters => {
  if (parameters.sourceType === 'url') {
    return request.get(parameters.source);
  }

  return fs.createReadStream(parameters.source);
};
