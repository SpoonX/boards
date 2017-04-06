class Generator {
  runSteps(steps) {
    return {steps};
  }

  complete() {
    return Promise.resolve();
  }

  defaults() {
    return {};
  }

  prepare(parameters) {
    return parameters;
  }
}

module.exports = {Generator};
