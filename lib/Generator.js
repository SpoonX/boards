class Generator {
  runSteps(steps) {
    return {steps};
  }

  complete(stream) {
    return Promise.resolve(stream);
  }

  static defaults() {
    return {};
  }

  prepare(parameters) {
    return parameters;
  }
}

module.exports = {Generator};
