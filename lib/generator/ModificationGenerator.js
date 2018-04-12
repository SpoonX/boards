const {Generator} = require('../Generator');
const path        = require('path');

class ModificationGenerator extends Generator {
  prepare(parameters) {
    parameters.targetDirectory = parameters.sourceDirectory;
    parameters.targetFile      = parameters.sourceFile + '.__tmp_replace';
    parameters._boards         = Object.assign(parameters._boards || {}, { finalTarget: 'source' });

    parameters.move = {
      sourceFile: path.join(parameters.sourceDirectory, parameters.targetFile),
      targetFile: path.join(parameters.sourceDirectory, parameters.sourceFile)
    };

    return parameters;
  }

  generate() {
    return this.runSteps(['read', 'modify','replace', 'write', 'move', 'format']);
  }
}

module.exports.ModificationGenerator = ModificationGenerator;
