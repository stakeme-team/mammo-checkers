import { StarknetProvider } from './context/StarknetProvider'
import { ConnectWallet } from './components/ConnectWallet'
import { Spawn } from './components/Spawn'
import { DojoContextProvider } from "./DojoContext";

function App() {
  return (
    <DojoContextProvider>
      <StarknetProvider>
        <ConnectWallet />
        <Spawn />
      </StarknetProvider>
    </DojoContextProvider>
  )
}
export default App