import type { DocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'

import type { Selection } from '#/core/graphql/codegen/selector'

const renderSelectionSet = (selection: Selection): string =>
  Object.entries(selection)
    .map(([key, value]) =>
      value === true ? key : `${key} { ${renderSelectionSet(value)} }`,
    )
    .join(' ')

export type OperationVariable = {
  name: string
  // Type as written in a query signature, e.g. 'Pagination', 'String!'.
  graphqlType: string
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

// Builds a query/mutation document for exactly `selection`.
// `selection: null` means a leaf scalar result (e.g. `*Count`), no `{ }` set.
export const buildOperationDocument = (
  kind: 'query' | 'mutation',
  operationName: string,
  variables: OperationVariable[],
  selection: Selection | null,
): DocumentNode => {
  const varDecl = variables.length
    ? `(${variables.map(v => `$${v.name}: ${v.graphqlType}`).join(', ')})`
    : ''
  const varUsage = variables.length
    ? `(${variables.map(v => `${v.name}: $${v.name}`).join(', ')})`
    : ''

  let body = `${operationName}${varUsage}`
  if (selection !== null) {
    const fieldSet = renderSelectionSet(selection)
    if (!fieldSet) {
      throw new Error(
        `buildOperationDocument(${operationName}): selection is empty after filtering - nothing left to query`,
      )
    }
    body += ` {\n    ${fieldSet}\n  }`
  }

  const source = `
${kind} ${capitalize(operationName)}${varDecl} {
  ${body}
}
`
  return gql(source)
}
