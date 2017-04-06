const procurator = require('procurator');

module.exports = (parameters, stream) => {
  return stream.pipe(procurator(parameters))
};
