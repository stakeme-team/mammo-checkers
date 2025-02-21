import React, { useCallback, useState } from "react";
import { useAccount } from '@starknet-react/core'

// const checkPlayerStatus = useCallback(async (accountAddress: string) => {
//   try {
//     // Проверка, находится ли игрок в очереди
//     const queueResponse = await fetch(
//       `http://localhost:5000/check-player-in-queue?playerAddress=${accountAddress}`
//     );
//     if (queueResponse.ok) {
//       const queueData = await queueResponse.json();
//       if (queueData.status === "found") {
//         setSubmitted(true);
//         onStatusChange("waiting");
//         return;
//       }
//     }

//     // Проверка, есть ли активная игра
//     const matchResponse = await fetch(
//       `http://localhost:5000/get-checkers-match?playerAddress=${accountAddress}`
//     );
//     if (matchResponse.ok) {
//       const matchData = await matchResponse.json();
//       if (matchData.status === "found") {
//         onStatusChange("playing");
//         return;
//       }
//     }
//     onStatusChange("idle");
//   } catch (error) {
//     console.error("Error checking player status:", error);
//   }
// }, [onStatusChange]);


export const JoinQueue = () => {
  const [submitted, setSubmitted] = useState<boolean>(false)
  const { account } = useAccount()
 
  const execute = useCallback(
    async () => {
      if (!account) return
      setSubmitted(true)
      try {
        const result = await account.execute([
          {
            contractAddress: "0x144dff36806782686e253f6b8b58103848391e14388ae9ac69fafe106c4991f",
            entrypoint: "join_queue",
            calldata: [1],
          },
        ]);
      console.log(result);
      } catch (e) {
        console.error(e)
      } finally {
        setSubmitted(false)
      }
    },
    [account],
  )

  if (!account) return null

  return (
    <div>
      <h2></h2>
      <button onClick={() => execute()} disabled={submitted}>
      Play
      </button>
    </div>
  )
}