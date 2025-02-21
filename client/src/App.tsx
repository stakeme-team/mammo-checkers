import React from 'react'
import { StarknetProvider } from './context/StarknetProvider'
import { ConnectWallet } from './components/ConnectWallet'
import { JoinQueue } from './components/PlayBtn'
 
function App() {
  return (
    <StarknetProvider>
      <ConnectWallet />
      <JoinQueue />
    </StarknetProvider>
  )
}
export default App