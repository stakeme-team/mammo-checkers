import React, { useEffect } from 'react'
import { gql, useSubscription } from '@apollo/client'
import { lookupAddresses } from '@cartridge/controller'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const skip = !matchId

  const { data, loading, error } = useSubscription(SUBSCRIBE_ONE_MATCH, {
    variables: { id: matchId },
    skip,
  })

  useEffect(() => {
    const handleMatchResult = async (matchModel: any) => {
      try {
        if (matchModel.status === 'Finished') {
          const addressMap = await lookupAddresses([matchModel.winner])
          const winnerName = addressMap.get(matchModel.winner) || 'Unknown Player'
          const confirmed = window.confirm(`Congratulations! Player ${winnerName} has won the game.\n\nClick OK to return to main menu.`)
          if (confirmed) {
            navigate('/')
          }
        } else if (matchModel.status === 'Draw') {
          const confirmed = window.confirm(`The match ended in a draw!\n\nClick OK to return to main menu.`)
          if (confirmed) {
            navigate('/')
          }
        }
      } catch (err) {
        console.error('Error handling match result:', err)
      }
    }

    if (error) {
      console.error("WatchOneMatch subscription error:", error)
      return
    }
    
    if (!loading && data) {
      console.log("Update for match:", matchId, data)
      const entity = data.entityUpdated
      if (entity && entity.models?.length > 0) {
        const matchModel = entity.models.find((m: any) => m.__typename === 'my_checkers_GameMatch')
        if (matchModel) {
          console.log("Match status:", matchModel.status, "winner:", matchModel.winner)
          handleMatchResult(matchModel)
        }
      }
    }
  }, [loading, data, error, matchId, navigate])

  if (skip) return null
  return <div>Watching Match ID: {matchId}</div>
}
