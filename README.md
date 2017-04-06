# Boards

An opinionated, simple, minimalistic and extendible code generator base.

This module makes it easy to use generators, and doesn't provide a cli to do so.
This means you can embed it your own cli tool without having to call extra tools (gulp, yo, etc).

This module makes use of [plugin-discovery](https://github.com/SpoonX/plugin-discovery) to discover plugins in your projects.

## Features

* Register boards
* Generators
* Register steps
* Manages stream
* Finds boards in project dependencies

## Installation

`npm i -D boards`

## Usage

Code speaks a thousand... Codes. Here's an example:

```js
let boards = new Boards({
  discoveryConfig: {
    prefix               : 'my-prefix',
    dictionaryKeyStrategy: PluginDiscovery.constants.STRATEGY_STRIP_PREFIX,
    configurers          : {
      myconfigurer: (key, plugin, rootImport) => {
        // Custom configuration
      }
    }
  }
});

boards.generate('generatorNameOrClass', {parameters: 'go here'});
```

An overview of options:

```js
{
  steps          : steps,
  generators     : {},
  sourceType     : 'file', // url or file (treats source value differently)
  discovery      : true, // Enable plugin discovery or not
  discoveryConfig: {}, // options for plugin-discovery
}
```

_**Note:** Options for plugin discovery [can be found here](https://github.com/SpoonX/plugin-discovery)._

## Generator

A generator is responsible for generating a file, and supplying the steps to do so. Here's an example (skeleton) generator.

```js
const {Generator} = require('boards');
const emoji       = require('node-emoji');
const path        = require('path');

class SkeletonGenerator extends Generator {
  static defaults() {
    return {
      sourceDirectory: path.join(__dirname, '../templates'),
      targetDirectory: path.join(process.cwd()),
      sourceFile     : `upper.template`,
      extension      : 'html'
    };
  }

  prepare(parameters) {
    console.log('\n', emoji.get('coffee') + ` Preparing parameters!\n`);

    parameters.targetFile = `${parameters.name}.${parameters.extension}`;

    return parameters;
  }

  generate(parameters) {
    console.log('\n', emoji.get('hourglass_flowing_sand') + ` Generating sincere greeting (with extra love)!\n`);

    return this.runSteps(['read', 'replace', 'upper', 'write']);
  }

  complete(stream) {
    console.log('\n', emoji.get('birthday') + ` Pointless file generated!\n`);

    return stream;
  }
}

module.exports = SkeletonGenerator;
```

## Step

A step is an action through which the templates stream.

Boards comes with a couple of default steps.

### Read

The read step is usually the first step in a generator's flow. It is responsible for creating the read stream.

#### Parameters

There are a couple of parameters you can pass in to change the behavior of this step.

|  Key          | Type  | Default | Description |
|:--------------|:------|:--------|:------------|
| sourceDirectory | string | `''` | Where to find the source files |
| sourceFile | string | `''` | The name of the source file |
| sourceType | string | `'file'` | One of url or file |
| source | string | `directory + file` | Combined parameter based on sourceDirectory and sourceFile |
| sourceUrl | string | `''` | The url of the template if sourceType is url |

_**Note:** Every generator gets to supply default values for these parameters; these are just the defaults for Boards._

### Replace

The replace step allows the use of variables in your templates.
Replace uses a tiny lib called [Procurator](https://github.com/SpoonX/procurator), take a look at the docs to know what's possible.
To give you an idea:

```html
<strong>Hello {{name:world}}</strong>
```

All parameters passed in are available in your templates.

### Write

The write step is generally the last step in a generator's flow and us responsible for writing the file to disk.

#### Parameters

There are a couple of parameters you can pass in to change the behavior of this step.

|  Key          | Type  | Default | Description |
|:--------------|:------|:--------|:------------|
| targetDirectory | string | `''` | Where to store the generated file |
| targetFile | string | `''` | The name of the target file |
| target | string | `directory + file` | Combined parameter based on targetDirectory and targetFile |
