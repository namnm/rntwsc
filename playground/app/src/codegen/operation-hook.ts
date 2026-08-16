import { createOperationHooks } from 'rntwsc/graphql/codegen/operation'

import { playgroundGraphQLUrl } from '@/pages/graphql/config'

export const { createQueryHook, createMutationFn, createQueryFn } =
  createOperationHooks({
    url: playgroundGraphQLUrl,
  })
