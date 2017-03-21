const procurator = require('procurator');
const fs         = require('fs');

module.exports = (parameters, stream) => {
  return stream.pipe(procurator(parameters))
};
