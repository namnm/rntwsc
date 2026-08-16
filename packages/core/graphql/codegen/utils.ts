import type { ErrorLike } from '@apollo/client'
import { CombinedGraphQLErrors, toErrorLike } from '@apollo/client/errors'

import type { OperationVariable } from '#/core/graphql/codegen/dynamic'
import { buildOperationDocument } from '#/core/graphql/codegen/dynamic'
import type {
  SelectedShape,
  Selection,
  Selector,
} from '#/core/graphql/codegen/selector'
import { selectFields } from '#/core/graphql/codegen/selector'

// Resolves/augments outgoing headers, e.g. attaching auth/org headers.
// See OperationHooksConfig below for the hook-body vs plain-function split.
export type HeadersResolver = (
  headers: Record<string, string> | undefined,
) =>
  | Record<string, string>
  | undefined
  | Promise<Record<string, string> | undefined>

export type OperationHooksConfig = {
  url: string
  // Keeps the `use` prefix for hook.ts's hook body though it's a plain
  // callback, not a real hook. See contribution/async-components.md#babel-plugin-async-hook.
  useQueryHeaders?: HeadersResolver
  // Called from fn.ts's plain async functions - ordinary await, no naming
  // constraint, must not rely on React hooks.
  resolveMutationHeaders?: HeadersResolver
}

export type OperationOptions<T, V, S = never> = {
  select?: (p: Selector<T>) => S
  variables?: V
  headers?: Record<string, string>
  // Forwarded to useFetchGraphQL's keySalt.
  // See contribution/hydration.md#dehydration-key-collisions-and-keysalt.
  keySalt?: string
}

// Reapplies SelectedShape inside T's wrapper shape (plain/nullable/array).
// Does not cover an array of nullable items - nothing emits that today.
export type ApplySelection<R, T, S> =
  R extends Array<infer U>
    ? U extends T
      ? Array<SelectedShape<T, S>>
      : R
    : R extends T
      ? SelectedShape<T, S>
      : R

// Shared result shape for every generated hook/fn. `errors` is the raw
// per-field GraphQL errors array; `error` is the single top-level failure.
export type OperationResult<TData> = {
  data?: TData
  error?: ErrorLike
  errors?: readonly unknown[]
  extensions?: Record<string, unknown>
}

export type MutationResult<TData> = OperationResult<TData>

// Apollo v4 folds GraphQL errors into one CombinedGraphQLErrors object -
// unwrap it so every hook/fn exposes the same `errors` array.
export const graphQLErrArr = (
  error: ErrorLike | undefined,
): readonly unknown[] | undefined =>
  error && CombinedGraphQLErrors.is(error) ? error.errors : undefined

// Unwraps the operation-name key out of an Apollo mutate/query result.
// `extensions` is passed in since only .mutate()'s result type carries it.
export const toOperationResult = <R>(
  operationName: string,
  result: { data?: Record<string, R>; error?: ErrorLike },
  extensions?: Record<string, unknown>,
): MutationResult<R> => ({
  data: result.data?.[operationName],
  error: result.error,
  errors: graphQLErrArr(result.error),
  extensions,
})

// Named once so every buildDocument call site reads as "the selection this
// call asked for", not a repeated ternary.
export const selectionOf = <T, S>(
  select: ((p: Selector<T>) => S) | undefined,
): Selection | null => (select ? selectFields<T>(select) : null)

// Same as buildOperationDocument, but catches the "selection empty" throw
// and hands it back as an ErrorLike - used by fn.ts's plain functions.
export const tryBuildDocument = (
  kind: 'query' | 'mutation',
  operationName: string,
  variableDefs: OperationVariable[],
  selection: Selection | null,
):
  | { document: ReturnType<typeof buildOperationDocument>; error?: undefined }
  | { document?: undefined; error: ErrorLike } => {
  try {
    return {
      document: buildOperationDocument(
        kind,
        operationName,
        variableDefs,
        selection,
      ),
    }
  } catch (err) {
    return {
      error: toErrorLike(err),
    }
  }
}

// Ordinary await, not subject to useQueryHeaders' `use`-prefix constraint.
export const resolveHeaders = async (
  resolver: HeadersResolver | undefined,
  headers: Record<string, string> | undefined,
): Promise<Record<string, string> | undefined> =>
  resolver ? await resolver(headers) : headers
