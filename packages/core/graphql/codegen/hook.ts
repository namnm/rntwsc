import { toErrorLike } from '@apollo/client/errors'

import { useFetchGraphQL } from '#/core/graphql'
import type { OperationVariable } from '#/core/graphql/codegen/dynamic'
import { buildOperationDocument } from '#/core/graphql/codegen/dynamic'
import type {
  ApplySelection,
  OperationHooksConfig,
  OperationOptions,
  OperationResult,
} from '#/core/graphql/codegen/utils'
import { selectionOf } from '#/core/graphql/codegen/utils'
import type { UseHydrationData } from '#/core/hydration/config'

export type QueryHookResult<TData> = OperationResult<TData> &
  Omit<UseHydrationData<unknown>, 'data' | 'error'>

// Binds createQueryHook to one GraphQL endpoint, for codegen to call once
// per Query field. Built on useFetchGraphQL for SSR-hydration support.
export const createQueryHookFactory =
  (config: OperationHooksConfig) =>
  // K pins data.data's key to the literal operation name so a typo'd field
  // is a type error. Must be explicit - TS won't infer a trailing omitted param.
  <K extends string, T, R, V extends Record<string, unknown>>(
    operationName: K,
    variableDefs: OperationVariable[],
  ) => {
    const useQuery = async <S = never>(
      options: OperationOptions<T, V, S> = {},
    ): Promise<QueryHookResult<ApplySelection<R, T, S>>> => {
      const { select, variables, headers, keySalt } = options
      // Not try/caught - runs ahead of useFetchGraphQL in the same hook body,
      // so catching here would break Rules of Hooks by skipping it on error.
      const document = buildOperationDocument(
        'query',
        operationName,
        variableDefs,
        selectionOf<T, S>(select),
      )
      const finalHeaders = config.useQueryHeaders
        ? await config.useQueryHeaders(headers)
        : headers
      // Must stay awaited, not returned directly.
      // See contribution/async-components.md#babel-plugin-async-hook.
      const d = await useFetchGraphQL<Record<K, ApplySelection<R, T, S>>>({
        url: config.url,
        query: document,
        variables,
        headers: finalHeaders,
        keySalt,
      })
      return {
        data: d.data?.data?.[operationName],
        error: d.error ? toErrorLike(d.error) : undefined,
        errors: d.data?.errors,
        loading: d.loading,
        refetch: d.refetch,
        dehydrateJsx: d.dehydrateJsx,
      }
    }
    return useQuery
  }
