// @flow

import { Runner, JSModuleParser } from 'relay-compiler/relay-compiler'
import fs from 'fs'
import getFilepathsFromGlob from './getFilepathsFromGlob'

import getSchema from './getSchema'
import getFileFilter from './getFileFilter'
import getWriter from './getWriter'

import type { Compiler } from 'webpack'

class RelayCompilerWebpackPlugin {
  parserConfigs = {
    default: {
      schema: '',
      baseDir: '',
      getFileFilter,
      getParser: null,
      getSchema: () => {},
    },
  }

  writerConfigs = {
    default: {
      getWriter: (...any: any) => {},
      isGeneratedFile: (filePath: string) => filePath.endsWith('.js') && filePath.includes('__generated__'),
      parser: 'default',
    },
  }

  constructor (options: {
    schema: string,
    src: string,
    transform: Array<string>,
    extensions: Array<string>,
    include: Array<string>,
    exclude: Array<string>
  }) {
    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.')
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema path.')
    }

    if (!fs.existsSync(options.schema)) {
      throw new Error('Could not find the Schema. Have you provided a fully resolved path?')
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.')
    }

    if (!fs.existsSync(options.src)) {
      throw new Error('Could not find your `src` path. Have you provided a fully resolved path?')
    }

    const extensions = options.extensions !== undefined ? options.extensions : [ 'js' ]
    const include = options.include !== undefined ? options.include : [ '**' ]
    const exclude = options.exclude !== undefined ? options.exclude : [
      '**/node_modules/**',
      '**/__mocks__/**',
      '**/__tests__/**',
      '**/__generated__/**',
    ]

    const fileOptions = {
      extensions,
      include,
      exclude,
    }

    this.parserConfigs.default.baseDir = options.src
    this.parserConfigs.default.schema = options.schema
    this.parserConfigs.default.getSchema = () => getSchema(options.schema)
    this.parserConfigs.default.transform = options.transform
    this.parserConfigs.default.filepaths = getFilepathsFromGlob(options.src, fileOptions)
    this.parserConfigs.default.getParser = JSModuleParser.getParser(options.transform)
    this.writerConfigs.default.getWriter = getWriter(options.src)
  }

  apply (compiler: Compiler) {
    let errors = [];
    compiler.plugin('before-compile', async (compilation, callback) => {
      errors = [];
      try {
        const runner = new Runner({
          parserConfigs: this.parserConfigs,
          writerConfigs: this.writerConfigs,
          onlyValidate: false,
          skipPersist: true,
          reporter: { reportError: (ns, e) => { 
            errors.push(e) }}
        })

        await runner.compileAll()
      } catch (error) {
          errors.push(error)
      }
      finally {
        callback()
      }
    })

    compiler.plugin("this-compilation", params => {
      // Don't know why but it seems we can report errors before
      // stuff actually is building.
      params.errors.push.apply(params.errors, errors)

    });
  }
}

module.exports = RelayCompilerWebpackPlugin
