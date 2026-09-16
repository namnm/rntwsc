// Emits a readonly field-name array per object/input type, e.g. `type User
// { id: String! }` becomes `export const UserFields = ['id'] as const`.
import type {
  GraphQLInputObjectType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql'
import { isInputObjectType, isObjectType } from 'graphql'

const ROOT_TYPE_NAMES = new Set(['Query', 'Mutation', 'Subscription'])

const isFieldedType = (
  t: GraphQLNamedType,
): t is GraphQLObjectType | GraphQLInputObjectType =>
  isObjectType(t) || isInputObjectType(t)

export const fieldNamesPlugin = (schema: GraphQLSchema): string => {
  const typeMap = schema.getTypeMap()
  const lines: string[] = []

  for (const [name, type] of Object.entries(typeMap).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (
      name.startsWith('__') ||
      ROOT_TYPE_NAMES.has(name) ||
      !isFieldedType(type)
    ) {
      continue
    }
    const fieldNames = Object.keys(type.getFields())
    const items = fieldNames.map(f => `'${f}'`).join(', ')
    lines.push(`export const ${name}Fields = [${items}] as const`)
  }

  return lines.join('\n') + '\n'
}
