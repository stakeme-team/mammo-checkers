import React, { useEffect } from 'react'
import { gql, useSubscription } from '@apollo/client'

const SUBSCRIBE_EVENT_MESSAGE_UPDATED = gql`
  subscription {
    eventMessageUpdated {
      models {
        ... on my_checkers_MatchCreated {
          match_id
          player1
          player2
          status
          game_type
        }
      }
    }
  }
`
const SUBSCRIBE_EVENT_MOVE_MADE = gql`
  subscription EventMessageUpdated {
    eventMessageUpdated {
        models {
            ... on my_checkers_MoveMade {
                match_id
                player
                from_x
                from_y
                to_x
                to_y
            }
        }
    }
}
`

export function MoveMadeSubscription({ 
  address, 
  match_id,
  sendMessage,
  current_turn,
}: { 
  match_id?: number,
  address?: string,
  sendMessage: (gameObject: string, method: string, parameter?: string) => void,
  current_turn?: number,
}) {
  const { data, loading, error } = useSubscription(SUBSCRIBE_EVENT_MOVE_MADE)

  useEffect(() => {
    if (error) {
      console.error('Subscription error:', error)
      return
    }
    if (!loading && data) {
      
      console.log('Got eventMessageUpdated:', data.eventMessageUpdated)

      const { models } = data.eventMessageUpdated
      if (models && models.length > 0) {
        const matchInfo = models[0]
        
        if (String(matchInfo.match_id) === String(match_id) && String(matchInfo.player) !== String(address)) {
        //TODO: NEED PROVIDE current_turn right, make new request from match or get from subsribe event
          sendMessage("Board", "UpdateBoardFromServer", current_turn)
        }
      }
    }
  }, [loading, data, error])
}

export function MatchCreatedSubscription() {
  const { data, loading, error } = useSubscription(SUBSCRIBE_EVENT_MESSAGE_UPDATED)

  useEffect(() => {
    if (error) {
      console.error('Subscription error:', error)
      return
    }
    if (!loading && data) {
      
      console.log('Got eventMessageUpdated:', data.eventMessageUpdated)

      // Распарсим:
      const { models } = data.eventMessageUpdated
      if (models && models.length > 0) {
        // Предположим, первый элемент — нужный match
        const matchInfo = models[0]
        console.log('Match created info:', matchInfo)

      }
    }
  }, [loading, data, error])

  return (
    <div>
      {loading && <p>Loading subscription...</p>}
      {!loading && <p>Listening for "MatchCreated" events...</p>}
    </div>
  )
}
