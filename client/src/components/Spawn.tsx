import { useCallback, useState } from 'react'
import { useDojo } from "../hooks/useDojo.tsx";
import ControllerConnector from '@cartridge/connector/controller'
 
export const Spawn = (controller: connector) => {
  const [submitted, setSubmitted] = useState<boolean>(false)
  const { account } = await controller.connect();
  const {
    setupWorld
  } = useDojo();
  const execute = useCallback(
    async () => {
      try {
        if (!account) return
        setSubmitted(true)
        await account.execute([{
          contractAddress: "0x525177c8afe8680d7ad1da30ca183e482cfcd6404c1e09d83fd3fa2994fd4b8",
          entrypoint: 'create_lobby',
          calldata: [],
        }
        ])
      } catch (e) {
        console.error(e)
      } finally {
        setSubmitted(false)
      }
    },
    [account, setupWorld]
  )
   
  if (!account) return null
 
  return (
    <div>
      <h2>Spawn</h2>
      <button onClick={() => execute()} disabled={submitted}>
        Spawn
      </button>
    </div>
  )
}