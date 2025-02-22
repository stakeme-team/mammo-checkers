// App.tsx
import React from 'react'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './graphql/client'
import { StarknetProvider } from './context/StarknetProvider' 

import { ConnectWallet } from './components/ConnectWallet'
import { JoinQueue } from './components/PlayBtn'           

function App() {
  return (
    <StarknetProvider>
      <ApolloProvider client={apolloClient}>
        <ConnectWallet />
        <JoinQueue />
      </ApolloProvider>
    </StarknetProvider>
  )
}

export default App
