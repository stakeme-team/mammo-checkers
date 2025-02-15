import { StarknetProvider } from './context/StarknetProvider'
import { ConnectWallet } from './components/ConnectWallet'
import { TransferEth } from './components/TransferEth'
 
function App() {
  return (
    <StarknetProvider>
      <ConnectWallet />
      <TransferEth />
    </StarknetProvider>
  )
}
export default App