import type { TypedDocumentNode } from '@apollo/client'

import type { OperationVariable } from 'rntwsc/graphql/codegen/dynamic'
import type {
  ApplySelection,
  MutationResult,
  OperationHooksConfig,
  OperationOptions,
} from 'rntwsc/graphql/codegen/utils'
import {
  resolveHeaders,
  selectionOf,
  toOperationResult,
  tryBuildDocument,
} from 'rntwsc/graphql/codegen/utils'
import { getApolloClient } from 'rntwsc/graphql/store'

// Binds createMutationFn/createQueryFn to one GraphQL endpoint, for codegen
// to call once per Mutation/Query field. Plain async functions, not hooks.
export const createOperationFnFactory = (config: OperationHooksConfig) => {
  const createMutationFn =
    <T, R, V extends Record<string, unknown>>(
      operationName: string,
      variableDefs: OperationVariable[],
    ) =>
    async <S = never>(
      options: OperationOptions<T, V, S> = {},
    ): Promise<MutationResult<ApplySelection<R, T, S>>> => {
      const { select, variables, headers } = options
      const built = tryBuildDocument(
        'mutation',
        operationName,
        variableDefs,
        selectionOf<T, S>(select),
      )
      if (built.error) {
        return {
          error: built.error,
        }
      }
      // Cast instead of <TData> on .mutate() - explicit generics hit Apollo's
      // deprecated overload; a TypedDocumentNode annotation infers it instead.
      const mutation = built.document as TypedDocumentNode<
        Record<string, ApplySelection<R, T, S>>
      >
      const finalHeaders = await resolveHeaders(
        config.resolveMutationHeaders,
        headers,
      )
      const result = await getApolloClient(config.url).mutate({
        mutation,
        variables,
        context: finalHeaders
          ? {
              headers: finalHeaders,
            }
          : undefined,
      })
      return toOperationResult(operationName, result, result.extensions)
    }

  // For a query fired on demand rather than bound to a component's render -
  // createQueryHook always fires on mount, which is wrong for that case.
  const createQueryFn =
    <T, R, V extends Record<string, unknown>>(
      operationName: string,
      variableDefs: OperationVariable[],
    ) =>
    async <S = never>(
      options: OperationOptions<T, V, S> = {},
    ): Promise<MutationResult<ApplySelection<R, T, S>>> => {
      const { select, variables, headers } = options
      const built = tryBuildDocument(
        'query',
        operationName,
        variableDefs,
        selectionOf<T, S>(select),
      )
      if (built.error) {
        return {
          error: built.error,
        }
      }
      const query = built.document as TypedDocumentNode<
        Record<string, ApplySelection<R, T, S>>
      >
      const finalHeaders = await resolveHeaders(
        config.resolveMutationHeaders,
        headers,
      )
      const result = await getApolloClient(config.url).query({
        query,
        variables,
        fetchPolicy: 'network-only',
        context: finalHeaders
          ? {
              headers: finalHeaders,
            }
          : undefined,
      })
      return toOperationResult(operationName, result)
    }

  return {
    createMutationFn,
    createQueryFn,
  }
}
