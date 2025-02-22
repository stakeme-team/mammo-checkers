import React, { useEffect } from 'react'
import { gql, useSubscription } from '@apollo/client'

const SUBSCRIBE_ONE_MATCH = gql`
  subscription WatchOneMatch($id: ID!) {
    entityUpdated(id: $id) {
      id
      updatedAt
      models {
        __typename
        ... on my_checkers_GameMatch {
          match_id
          status
          winner
        }
      }
    }
  }
`

interface WatchMatchProps {
  matchId: string  
}

export function WatchMatch({ matchId }: WatchMatchProps) {
  const skip = !matchId

  const { data, loading, error } = useSubscription(SUBSCRIBE_ONE_MATCH, {
    variables: { id: matchId },
    skip,
  })

  useEffect(() => {
    if (error) {
      console.error("WatchOneMatch subscription error:", error)
    }
    if (!loading && data) {
      console.log("Update for match:", matchId, data)
      const entity = data.entityUpdated
      if (entity && entity.models?.length > 0) {
        const matchModel = entity.models.find((m: any) => m.__typename === 'my_checkers_GameMatch')
        if (matchModel) {
          console.log("Match status:", matchModel.status, "winner:", matchModel.winner)
          if (matchModel.status === 'Finished') {
            alert(`Match is finished! Winner = ${matchModel.winner}`)
          }
        }
      }
    }
  }, [loading, data, error, matchId])

  if (skip) return null
  return <div>Watching Match ID: {matchId}</div>
}
