'use strict';

var _relayCompiler = require('relay-compiler');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _getFilepathsFromGlob = require('./getFilepathsFromGlob');

var _getFilepathsFromGlob2 = _interopRequireDefault(_getFilepathsFromGlob);

var _getSchema = require('./getSchema');

var _getSchema2 = _interopRequireDefault(_getSchema);

var _getFileFilter = require('./getFileFilter');

var _getFileFilter2 = _interopRequireDefault(_getFileFilter);

var _getWriter = require('./getWriter');

var _getWriter2 = _interopRequireDefault(_getWriter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class RelayCompilerWebpackPlugin {

  constructor(options) {
    this.parserConfigs = {
      default: {
        schema: '',
        baseDir: '',
        getFileFilter: _getFileFilter2.default,
        getParser: null,
        getSchema: () => {}
      }
    };
    this.writerConfigs = {
      default: {
        getWriter: (...any) => {},
        parser: 'default'
      }
    };

    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.');
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema path.');
    }

    if (!_fs2.default.existsSync(options.schema)) {
      throw new Error('Could not find the Schema. Have you provided a fully resolved path?');
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.');
    }

    if (!_fs2.default.existsSync(options.src)) {
      throw new Error('Could not find your `src` path. Have you provided a fully resolved path?');
    }

    const extensions = options.extensions !== undefined ? options.extensions : ['js'];
    const include = options.include !== undefined ? options.include : ['**'];
    const exclude = options.exclude !== undefined ? options.exclude : ['**/node_modules/**', '**/__mocks__/**', '**/__tests__/**', '**/__generated__/**'];

    const fileOptions = {
      extensions,
      include,
      exclude
    };

    this.parserConfigs.default.baseDir = options.src;
    this.parserConfigs.default.schema = options.schema;
    this.parserConfigs.default.getSchema = () => (0, _getSchema2.default)(options.schema);
    this.parserConfigs.default.transform = options.transform;
    this.parserConfigs.default.filepaths = (0, _getFilepathsFromGlob2.default)(options.src, fileOptions);
    this.parserConfigs.default.getParser = _relayCompiler.JSModuleParser.getParser(options.transform);
    this.writerConfigs.default.getWriter = (0, _getWriter2.default)(options.src);
  }

  apply(compiler) {
    var _this = this;

    compiler.plugin('before-compile', (() => {
      var _ref = _asyncToGenerator(function* (compilation, callback) {
        try {
          const runner = new _relayCompiler.Runner({
            parserConfigs: _this.parserConfigs,
            writerConfigs: _this.writerConfigs,
            onlyValidate: false,
            skipPersist: true,
            reporter: { reportError: function reportError(ns, e) {
                compilation.error.push(e);
              } }
          });

          yield runner.compileAll();
        } catch (error) {
          compilation.errors.push(error);
        } finally {
          callback();
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })());
  }
}

module.exports = RelayCompilerWebpackPlugin;