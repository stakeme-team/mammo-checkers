// App.tsx
import React from 'react'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './graphql/client'
import { StarknetProvider } from './context/StarknetProvider' 

import { ConnectWallet } from './components/ConnectWallet'
import { JoinQueue } from './components/PlayBtn'           
import { MatchCreatedSubscription } from './components/EventsSubscription' 

function App() {
  return (
    <StarknetProvider>
      <ApolloProvider client={apolloClient}>
        <ConnectWallet />
        <JoinQueue />
        <MatchCreatedSubscription />
      </ApolloProvider>
    </StarknetProvider>
  )
}

export default App
