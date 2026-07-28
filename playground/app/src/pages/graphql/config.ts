import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'

import { serverOrigin } from '@/pages/fetch/config'

export const playgroundGraphQLUrl = `${serverOrigin}/api/graphql`

export type HelloData = {
  hello: {
    message: string
    timestamp: number
  } | null
}

export const HELLO_QUERY: TypedDocumentNode<HelloData> = gql`
  query Hello {
    hello {
      message
      timestamp
    }
  }
`
