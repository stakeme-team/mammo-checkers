import React, { useEffect } from 'react';
import { useAccount } from '@starknet-react/core';
import { gql, useSubscription } from '@apollo/client';

const SUBSCRIBE_DRAW_OFFERED = gql`
  subscription DrawOffered($matchId: Int!) {
    eventMessageUpdated {
      models {
        ... on my_checkers_DrawOffered {
          match_id
          player
        }
      }
    }
  }
`;

export const DrawSubscription = ({ 
  matchId,
  onDrawOffer 
}: { 
  matchId: number,
  onDrawOffer: (matchId: number, playerAddress: string) => void 
}) => {
  const { account } = useAccount();
  const { data, loading, error } = useSubscription(SUBSCRIBE_DRAW_OFFERED, {
    variables: { matchId },
    skip: !matchId
  });

  useEffect(() => {
    if (error) {
      console.error('DrawSubscription error:', error);
      return;
    }
    
    if (!loading && data) {
      const { models } = data.eventMessageUpdated;
      if (models && models.length > 0) {
        const drawOffer = models.find(
          (m: any) => m.__typename === 'my_checkers_DrawOffered' && m.match_id === matchId
        );

        if (drawOffer && drawOffer.player !== account?.address) {
          console.log('Draw offered detected:', drawOffer);
          onDrawOffer(drawOffer.match_id, drawOffer.player);
        }
      }
    }
  }, [loading, data, error, account, onDrawOffer, matchId]);

  return null;
}; 