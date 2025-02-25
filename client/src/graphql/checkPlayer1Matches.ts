import { gql } from "@apollo/client";

export const CHECK_PLAYER1_MATCHES = gql`
	query MyCheckersGameMatchModels($player: String!) {
		myCheckersGameMatchModels(where: { player1: $player }, first: 1) {
			edges {
				node {
					match_id
					player1
					player2
					bet_amount
					game_type
					status
					current_turn
					chain_capture_in_progress
					last_move_timestamp
					move_count
					winner
				}
			}
		}
	}
`;
