import { createOperationFnFactory } from 'rntwsc/graphql/codegen/fn'
import { createQueryHookFactory } from 'rntwsc/graphql/codegen/hook'
import type { OperationHooksConfig } from 'rntwsc/graphql/codegen/utils'

// Builds { createQueryHook, createMutationFn, createQueryFn } bound to one
// GraphQL endpoint. See hook.ts and fn.ts for what each factory does.
export const createOperationHooks = (config: OperationHooksConfig) => ({
  createQueryHook: createQueryHookFactory(config),
  ...createOperationFnFactory(config),
})
