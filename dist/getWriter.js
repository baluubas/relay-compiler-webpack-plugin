'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getWriter;

var _relayCompiler = require('relay-compiler');

var _formatGeneratedModule = require('./formatGeneratedModule');

var _formatGeneratedModule2 = _interopRequireDefault(_formatGeneratedModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const codegenTransforms = _relayCompiler.IRTransforms.codegenTransforms,
      fragmentTransforms = _relayCompiler.IRTransforms.fragmentTransforms,
      printTransforms = _relayCompiler.IRTransforms.printTransforms,
      queryTransforms = _relayCompiler.IRTransforms.queryTransforms,
      schemaExtensions = _relayCompiler.IRTransforms.schemaExtensions;
function getWriter(baseDir) {
  return (onlyValidate, schema, documents, baseDocuments) => {
    return new _relayCompiler.FileWriter({
      config: {
        formatModule: _formatGeneratedModule2.default,
        compilerTransforms: {
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms
        },
        baseDir,
        schemaExtensions: schemaExtensions
      },
      onlyValidate,
      schema,
      baseDocuments,
      documents
    });
  };
}