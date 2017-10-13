// @flow

import { FileWriter, IRTransforms } from 'relay-compiler'
import type { Map } from 'immutable'
import type { GraphQLSchema } from 'graphql'
import formatGeneratedModule from './formatGeneratedModule'

const {
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaTransforms,
} = IRTransforms

export default function getWriter (baseDir: string) {
  return (onlyValidate: boolean, schema: GraphQLSchema, documents: Map<string, Object>, baseDocuments: Map<string, Object>) => {
    return new FileWriter({
      config: {
        formatModule: formatGeneratedModule,
        compilerTransforms: {
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms,
        },
        baseDir,
        schemaTransforms,
        schemaExtensions: [] 
      },
      onlyValidate,
      schema,
      baseDocuments,
      documents,
    })
  }
}
