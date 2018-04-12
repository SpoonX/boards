const {Generator} = require('../Generator');

class CopyGenerator extends Generator {
  generate() {
    return this.runSteps(['read', 'write']);
  }
}

module.exports.CopyGenerator = CopyGenerator;
