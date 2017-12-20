const {Generator} = require('../Generator');

class TemplateGenerator extends Generator {
  generate() {
    return this.runSteps(['read', 'replace', 'write', 'format']);
  }
}

module.exports.TemplateGenerator = TemplateGenerator;
