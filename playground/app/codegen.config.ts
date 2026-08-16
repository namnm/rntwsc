import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://rntwsc.namnm.com/api/graphql',
  generates: {
    './src/codegen/graphql.min.ts': {
      plugins: ['typescript', 'rntwsc/devtools/graphql-codegen-plugin'],
    },
  },
  // hooks: {
  //   afterAllFileWrite: ['prettier --write'],
  // },
}

export default config
