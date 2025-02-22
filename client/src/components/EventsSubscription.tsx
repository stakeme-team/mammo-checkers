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
