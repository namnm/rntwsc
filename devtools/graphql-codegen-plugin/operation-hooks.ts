// Emits a useFetch<Field> hook per Query field and a plain fn per Mutation
// field; the consumer's ./operation-hook re-exports createOperationHooks(...) with its own auth/policy logic.
import type {
  GraphQLArgument,
  GraphQLField,
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
} from 'graphql'
import {
  getNamedType,
  isEnumType,
  isListType,
  isNonNullType,
  isScalarType,
} from 'graphql'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Mirrors the `typescript` codegen plugin's default scalar mapping.
// Custom scalars fall back to `unknown`.
const BUILTIN_SCALAR_TS: Record<string, string> = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number',
}

const namedTypeToTs = (named: GraphQLNamedType): string =>
  BUILTIN_SCALAR_TS[named.name] ??
  (isScalarType(named) ? 'unknown' : named.name)

// Renders the TS type for a GraphQL type, unwrapping List/NonNull like the
// `typescript` plugin does; a nullable type is wrapped in `maybeWrapper<...>`.
const renderTsType = (
  type: GraphQLOutputType | GraphQLInputType,
  maybeWrapper: string,
): string => {
  if (isNonNullType(type)) {
    return renderTsTypeNonNull(type.ofType, maybeWrapper)
  }
  return `${maybeWrapper}<${renderTsTypeNonNull(type, maybeWrapper)}>`
}
const renderTsTypeNonNull = (
  type: GraphQLOutputType | GraphQLInputType,
  maybeWrapper: string,
): string => {
  if (isNonNullType(type)) {
    return renderTsTypeNonNull(type.ofType, maybeWrapper)
  }
  if (isListType(type)) {
    return `Array<${renderTsType(type.ofType, maybeWrapper)}>`
  }
  return namedTypeToTs(type)
}

// Collects every named type this render touches, so the output can import
// exactly what it needs.
const collectNamedType = (
  type: GraphQLOutputType | GraphQLInputType,
  usedTypes: Set<string>,
) => {
  const named = getNamedType(type)
  const ts = namedTypeToTs(named)
  if (ts === named.name) {
    usedTypes.add(ts)
  }
}

const renderArgProperty = (
  arg: GraphQLArgument,
  usedTypes: Set<string>,
): string => {
  collectNamedType(arg.type, usedTypes)
  if (isNonNullType(arg.type)) {
    return `${arg.name}: ${renderTsTypeNonNull(arg.type.ofType, 'InputMaybe')}`
  }
  return `${arg.name}?: InputMaybe<${renderTsTypeNonNull(arg.type, 'InputMaybe')}>`
}

const renderVariableDefs = (args: readonly GraphQLArgument[]): string =>
  args
    .map(
      arg => `{ name: '${arg.name}', graphqlType: '${arg.type.toString()}' }`,
    )
    .join(', ')

const isLeafField = (field: GraphQLField<unknown, unknown>): boolean => {
  const named = getNamedType(field.type)
  return isScalarType(named) || isEnumType(named)
}

const renderHook = (
  field: GraphQLField<unknown, unknown>,
  kind: 'query' | 'mutation',
  usedTypes: Set<string>,
): string => {
  // Queries are hooks (useFetchX); mutations are plain functions (x).
  const exportName =
    kind === 'query' ? `useFetch${capitalize(field.name)}` : field.name
  const factory = kind === 'query' ? 'createQueryHook' : 'createMutationFn'
  const args = [...field.args]
  const argsTs = args.length
    ? `{ ${args.map(arg => renderArgProperty(arg, usedTypes)).join('; ')} }`
    : 'Record<string, never>'
  const variableDefs = renderVariableDefs(args)
  const resultTs = renderTsType(field.type, 'Maybe')

  // `select`'s Selector<T> operates on the field's own named type, or the
  // result type itself for a leaf (scalar/enum) result, which has nothing to select.
  collectNamedType(field.type, usedTypes)
  const itemTs = isLeafField(field) ? resultTs : getNamedType(field.type).name

  // createQueryHook's first type arg (`K`) must be the operation name
  // literal - see core/graphql/codegen/operation.ts.
  const typeArgs =
    kind === 'query'
      ? `'${field.name}', ${itemTs}, ${resultTs}, ${argsTs}`
      : `${itemTs}, ${resultTs}, ${argsTs}`

  return `export const ${exportName} = ${factory}<${typeArgs}>('${field.name}', [${variableDefs}])`
}

export const operationHooksPlugin = (schema: GraphQLSchema): string => {
  const usedTypes = new Set<string>()
  const lines: string[] = []

  const targets: Array<
    ['query' | 'mutation', GraphQLObjectType | null | undefined]
  > = [
    ['query', schema.getQueryType()],
    ['mutation', schema.getMutationType()],
  ]

  for (const [kind, type] of targets) {
    if (!type) {
      continue
    }
    const fields = Object.values(type.getFields()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
    for (const field of fields) {
      lines.push(renderHook(field, kind, usedTypes))
    }
  }

  const header = [
    "import { createMutationFn, createQueryHook } from './operation-hook'",
    '',
  ].join('\n')

  return header + lines.join('\n') + '\n'
}
