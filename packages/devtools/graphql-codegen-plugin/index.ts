import type { GraphQLSchema } from 'graphql'

import { fieldNamesPlugin } from '#/devtools/graphql-codegen-plugin/field-names'
import { operationHooksPlugin } from '#/devtools/graphql-codegen-plugin/operation-hooks'

// graphql-codegen calls this once and writes the return value as-is, so
// the two generators are concatenated here instead of registered separately.
export const plugin = (schema: GraphQLSchema): string =>
  [fieldNamesPlugin(schema), operationHooksPlugin(schema)].join('\n')
