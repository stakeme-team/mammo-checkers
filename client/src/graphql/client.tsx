import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = new HttpLink({
  uri: 'https://api.cartridge.gg/x/mammo-checkers/torii/graphql',
})

const wsLink = new GraphQLWsLink(createClient({
    url: 'wss://api.cartridge.gg/x/mammo-checkers/torii/graphql',
    on: {
      connected: (socket, payload) => {
        console.log('WS connected:', payload)
      },
      error: (err) => {
        console.error('WS error:', err)
      },
      closed: (event) => {
        console.log('WS closed:', event)
      },
    },
  }))
  
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})
console.log("init")
