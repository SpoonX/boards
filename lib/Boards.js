const {PluginDiscovery} = require('plugin-discovery');
const path              = require('path');
const {Homefront}       = require('homefront');
const steps             = require('./step/index');
const generators        = require('./generator/index');
const {Generator}       = require('./Generator');
const glob              = require('glob');

class Boards {
  constructor(config = {}) {
    this.setConfig(config);
  }

  setConfig(config) {
    this.config = Homefront.merge({
      steps,
      generators,
      sourceType     : 'file', // url or file (treats source value differently)
      discovery      : true,
      discoveryConfig: {
        dictionaryKeyStrategy: PluginDiscovery.constants.STRATEGY_STRIP_PREFIX,
        prefix               : 'board',
        configurers          : {
          boards: (name, plugin, root) => {
            if (root.steps && typeof root.steps === 'object') {
              Object.assign(this.config.steps, root.steps);
            }

            if (root.generators && typeof root.generators === 'object') {
              Object.assign(this.config.generators, root.generators);
            }
          }
        }
      }
    }, config);

    if (this.config.discovery) {
      this.discover();
    }

    this.config = Homefront.merge(
      this.config,
      {generators: config.generators || {}},
      {steps     : config.steps || {}}
    );
  }

  discover() {
    PluginDiscovery.discoverSync(this.config.discoveryConfig);
  }

  getGenerator(generator) {
    if (generator instanceof Generator) {
      return generator;
    }

    if (typeof generator !== 'string') {
      throw new Error('Invalid type supplied for generator.');
    }

    let generatorTarget = this.config.generators[generator];

    if (typeof generatorTarget === 'function') {
      return generatorTarget;
    }

    throw new Error('Unknown or corrupt generator requested.');
  }

  applyStep(stepName, parameters, stream) {
    let step = stepName;

    if (typeof stepName === 'string') {
      step = this.config.steps[stepName];
    }

    if (typeof step !== 'function') {
      return Promise.reject(new Error(`Step "${stepName}" not found`));
    }

    let result = step(parameters, stream);

    if (typeof result.then === 'function') {
      return result;
    }

    return Promise.resolve(result);
  }

  applySteps(steps, parameters) {
    let chain = Promise.resolve();

    steps.forEach(step => {
      chain = chain.then(stream => this.applyStep(step, parameters, stream));
    });

    return chain;
  }

  static generate(board, parameters = {}, config = {}) {
    let boards = new Boards(config);

    return boards.generate(board, parameters);
  }

  generate(generatorName, parameters = {}) {
    let Generator = this.getGenerator(generatorName);
    let generator;

    generator  = new Generator(this.config);
    parameters = Homefront.merge(Generator.defaults(), parameters);

    return Promise.resolve(generator.prepare(parameters))
      .then(parameters => {
        parameters.source = path.join(parameters.sourceDirectory, parameters.sourceFile);
        parameters.target = path.join(parameters.targetDirectory, parameters.targetFile);

        return this.applySteps(generator.generate(parameters).steps, parameters);
      })
      .then(stream => {
        return new Promise((resolve, reject) => {
          stream.on('error', reject);
          stream.on('close', () => resolve(stream));
        });
      })
      .then(stream => generator.complete(stream));
  }
}

module.exports = {Boards};
