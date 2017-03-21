const path        = require('path');
const {Homefront} = require('homefront');
const steps       = require('./step/index');

// @todo allow exports from board: Generator, generators, task, tasks. Default to Generator if not named export.
class Boards {
  constructor(config = {}) {
    let generators = {};

    if (!config.skipDiscovery) {
      generators = this.discoverGenerators();
    }

    this.config = Homefront.merge({sourceType: 'file', steps, generators}, config);
  }

  discoverGenerators() {
    let packageJson;

    // @todo find way to locate globally installed modules
    // @todo like so https://github.com/egoist/global-node-modules/blob/master/index.js
    // @todo or one that actually works: https://github.com/jonschlinkert/global-paths/blob/master/index.js
    try {
      packageJson = require(path.join(process.cwd(), 'package.json'));
    } catch (error) {
      console.warn(`Error loading 'package.json'. Are you in the right directory?`);
    }

    let dependencies = Object.assign((packageJson.dependencies || {}), (packageJson.devDependencies || {}));
    let generators   = {};

    Reflect.ownKeys(dependencies)
      .filter(module => module.match(/^board-/))
      .forEach(boardModule => {
        let board = this.loadBoard(boardModule);

        generators[board.name()] = board;
      });

    return generators;
  }

  loadBoard(boardModule) {
    let board;

    try {
      board = require(boardModule);
    } catch (error) {
      console.error(`Error loading '${boardModule}'. Did you forget to run "npm install"?`);

      throw error;
    }

    if (typeof board === 'object') {
      board = board.Generator;
    }

    return board;
  }

  getGenerator(generator) {
    return new Promise((resolve, reject) => {
      try {
        let Generator = this.config.generators[generator];

        if (!Generator) {
          return reject(new Error(`Generator "${generatorName}" not found.`));
        }

        return resolve(Generator);
      } catch (error) {
        reject(error);
      }
    });
  }

  applyStep(stepName, parameters, stream) {
    let step = this.config.steps[stepName];

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

  static generate(board, parameters = {}) {
    if (typeof board === 'string') {
      board = this.loadBoard(board);
    }

    let boards = new Boards({skipDiscovery: true, generators: {[board.name()]: name}});

    return boards.generate(board.name(), parameters);
  }

  generate(generatorName, parameters = {}) {
    let generator;

    return this.getGenerator(generatorName)
      .then(Generator => {
        let stream;

        generator  = new Generator(this.config);
        parameters = Homefront.merge(Generator.defaults(), parameters);

        if (typeof generator.prepare === 'function') {
          return generator.prepare(parameters);
        }

        return parameters;
      })
      .then(parameters => {
        parameters.source = path.join(parameters.sourceDirectory, parameters.sourceFile);
        parameters.target = path.join(parameters.targetDirectory, parameters.targetFile);

        return parameters;
      })
      .then(parameters => this.applySteps(generator.generate(parameters).steps, parameters))
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
