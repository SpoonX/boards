const {Boards}                = require('./lib/Boards');
const {Generator}             = require('./lib/Generator');
const {ModificationGenerator} = require('./lib/generator/ModificationGenerator');
const {TemplateGenerator}     = require('./lib/generator/TemplateGenerator');
const {CopyGenerator}         = require('./lib/generator/CopyGenerator');

module.exports = {Boards, Generator, ModificationGenerator, TemplateGenerator, CopyGenerator};
