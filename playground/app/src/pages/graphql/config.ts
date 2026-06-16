import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'

export const playgroundGraphQLUrl = 'http://192.168.5.199:3001/api/graphql'

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
