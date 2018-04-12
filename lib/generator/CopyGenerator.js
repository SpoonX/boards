const {Generator} = require('../Generator');
const path        = require('path');

class CopyGenerator extends Generator {
  prepare(parameters) {
    parameters.targetDirectory = parameters.sourceDirectory;
    parameters.targetFile      = parameters.sourceFile;

    parameters.move = {
      sourceFile: path.join(parameters.sourceDirectory, parameters.targetFile),
      targetFile: path.join(parameters.sourceDirectory, parameters.sourceFile)
    };

    return parameters;
  }

  generate() {
    return this.runSteps(['read', 'write']);
  }
}

module.exports.CopyGenerator = CopyGenerator;
