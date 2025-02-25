import { gql } from "@apollo/client";

export const CHECK_QUEUE_QUERY = gql`
	query MyCheckersMatchQueueModels($player: String!) {
		myCheckersMatchQueueModels(where: { first_player: $player }) {
			edges {
				node {
					game_type
					first_player
					waiting_count
					queue_id
				}
			}
		}
	}
`;
