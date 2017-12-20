# Boards

A minimalistic and extendable code generator/manipulator base.

This project allows you to generate and manipulate code easily, making it a breeze to build your own cli.
This means you can embed it your own cli tool without having to call extra tools (gulp, yo, etc).

An (very cool, try it) example can be found here: [Boards-cli](https://github.com/SpoonX/boards-cli).

Boards makes use of [plugin-discovery](https://github.com/SpoonX/plugin-discovery) to discover plugins in your projects.

## Features

* Code formatting **New!**
* Register boards
* Generators
* Register steps
* Manages stream
* Finds boards in project dependencies

As of v3, Boards allows you to automatically format code when using the default generators (Modification and Template). To do this, it uses prettier to do base formatting, and then applies eslint rules (using `cwd`) to make any code adjust to whatever project it's being used in. To enable this option, set `format` to true. Read more [in the format section of the readme](#format)

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

A generator is responsible for generating or manipulating a file, and supplying the steps to do so.

### Default generators

This project comes with two default generators that can be extended or utilized.

#### TemplateGenerator

```js
const {ModificationGenerator} = require('boards');
```

This is probably the easiest a generator gets. It runs the following steps:

- read
- replace
- write
- format

This generator is useful for copying template files into your project.
Because the replace step uses Procurator for templating, you can make your templates dynamic.

#### ModificationGenerator

```js
const {TemplateGenerator} = require('boards');
```

The modification generator included runs the following steps:

- read
- modify
- replace
- write
- move
- format

This is useful to quickly edit existing files in your project and also allows using parameters in your replacement strings!
Read the docs on steps below to find out how to use them.

### Custom generator

Here's an example (skeleton) generator to give you an idea of what is involved.

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

### Modify

The modify step allows you to modify existing files in your project. This is useful when adding routes for example.

#### Parameters

To modify a file, use the `modify` property in the parameters.

`{modify: {patch: [{pattern, append, prepend, custom}]}`

|  Key          | Type  | Default | Description |
|:--------------|:------|:--------|:------------|
| patch | {}/{}[] | `''` | Patch instructions (object or array of objects) |
| patch.pattern | RegExp | `undefined` | Pattern to apply replacement on |
| patch.append | string | `undefined` | (optional) what to append to match |
| patch.prepend | string | `undefined` | (optional) what to prepend to match |
| patch.custom | function | `undefined` | (optional) callback for replace (uses [stream-replace](https://npmjs.com/package/stream-replace)) |

#### Example

```js
parameters.modify = {
  patch: {
    pattern: /];\s*module/,
    prepend: `  '${name}',\n`
  }
};
```

### Move

The move step allows you to move a file. This is useful in combination with the `modify` step.

#### Parameters

To move a file, use the `move` property in the parameters.

`{move: {sourceFile, targetFile}}`

|  Key          | Type  | Default | Description |
|:--------------|:------|:--------|:------------|
| sourceFile | string | `''` | Full path to the file to move |
| targetFile | string | `''` | Full path to the new location |

#### Example

```js
parameters.move = {
  sourceFile: path.join(parameters.sourceDirectory, parameters.targetFile),
  targetFile: path.join(parameters.sourceDirectory, parameters.sourceFile)
};
```

### Format

The format step allows you to format the file used in a generator.

**Note:** Formatting should be applied _after_ the write step.

#### Parameters

To format a file, use the `format` property in the parameters.

`{format: true`

|  Key          | Type  | Default | Description |
|:--------------|:------|:--------|:------------|
| format | boolean | `false` | Flag indicating if formatting should be applied |

#### Example

```js
parameters.format = true;
```

## Licence

MIT
