import React, { useEffect } from "react";
import { gql, useSubscription, useQuery, useLazyQuery } from "@apollo/client";

export const SUBSCRIBE_EVENT_MESSAGE_UPDATED = gql`
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
`;
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
`;

export function MoveMadeSubscription({
	address,
	match_id,
	sendMessage,
}: {
	match_id?: number;
	address?: string;
	sendMessage: (gameObject: string, method: string, parameter?: string) => void;
}) {
	const { data, loading, error } = useSubscription(SUBSCRIBE_EVENT_MOVE_MADE);
	const { refetch: refetchTurn } = useQuery(
		gql`
			query MyCheckersGameMatchModels($match_id: Int!) {
				myCheckersGameMatchModels(first: 1, where: { match_id: $match_id }) {
					edges {
						node {
							current_turn
						}
					}
				}
			}
		`,
		{
			variables: { match_id },
			skip: true, // Изначально запрос не выполняется
			fetchPolicy: "network-only",
		}
	);

	useEffect(() => {
		if (error) {
			console.error("Subscription error:", error);
			return;
		}
		if (!loading && data) {
			console.log("Got eventMessageUpdated:", data.eventMessageUpdated);

			const { models } = data.eventMessageUpdated;
			if (models && models.length > 0) {
				const matchInfo = models[0];

				if (
					String(matchInfo.match_id) === String(match_id) &&
					String(matchInfo.player) !== String(address)
				) {
					const fetchTurn = async () => {
						const { data } = await refetchTurn({
							match_id: matchInfo.match_id,
						});
						if (data) {
							const currentTurn =
								data.myCheckersGameMatchModels.edges[0].node.current_turn;
							sendMessage("Board", "UpdateBoardFromServer", currentTurn);
						}
					};
					fetchTurn();
				}
			}
		}
	}, [loading, data, error]);

	return null;
}

export function MatchCreatedSubscription({
	onMatchCreated,
}: {
	onMatchCreated: (matchInfo: any) => void;
}) {
	const { data, loading, error } = useSubscription(
		SUBSCRIBE_EVENT_MESSAGE_UPDATED
	);

	useEffect(() => {
		if (error) {
			console.error("Subscription error:", error);
			return;
		}
		console.log(loading);

		if (data) {
			const { models } = data.eventMessageUpdated;
			if (models && models.length > 0) {
				const matchInfo = models[0];
				console.log("Match created info:", matchInfo);

				onMatchCreated(matchInfo);
			}
		}
	}, [loading, data, error, onMatchCreated]);

	return <></>;
}
