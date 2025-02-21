import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_cornerMakeMoves_calldata = (matchId: BigNumberish, steps: Array<[BigNumberish, BigNumberish, BigNumberish, BigNumberish]>): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "corner_make_moves",
			calldata: [matchId, steps],
		};
	};

	const actions_cornerMakeMoves = async (snAccount: Account | AccountInterface, matchId: BigNumberish, steps: Array<[BigNumberish, BigNumberish, BigNumberish, BigNumberish]>) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_cornerMakeMoves_calldata(matchId, steps),
				"my_checkers",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_queue_system_joinQueue_calldata = (gameType: CairoCustomEnum): DojoCall => {
		return {
			contractName: "queue_system",
			entrypoint: "join_queue",
			calldata: [gameType],
		};
	};

	const queue_system_joinQueue = async (snAccount: Account | AccountInterface, gameType: CairoCustomEnum) => {
		try {
			return await provider.execute(
				snAccount,
				build_queue_system_joinQueue_calldata(gameType),
				"my_checkers",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_makeMove_calldata = (matchId: BigNumberish, fromX: BigNumberish, fromY: BigNumberish, toX: BigNumberish, toY: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "make_move",
			calldata: [matchId, fromX, fromY, toX, toY],
		};
	};

	const actions_makeMove = async (snAccount: Account | AccountInterface, matchId: BigNumberish, fromX: BigNumberish, fromY: BigNumberish, toX: BigNumberish, toY: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_makeMove_calldata(matchId, fromX, fromY, toX, toY),
				"my_checkers",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_offerDraw_calldata = (matchId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "offer_draw",
			calldata: [matchId],
		};
	};

	const actions_offerDraw = async (snAccount: Account | AccountInterface, matchId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_offerDraw_calldata(matchId),
				"my_checkers",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			cornerMakeMoves: actions_cornerMakeMoves,
			buildCornerMakeMovesCalldata: build_actions_cornerMakeMoves_calldata,
			makeMove: actions_makeMove,
			buildMakeMoveCalldata: build_actions_makeMove_calldata,
			offerDraw: actions_offerDraw,
			buildOfferDrawCalldata: build_actions_offerDraw_calldata,
		},
		queue_system: {
			joinQueue: queue_system_joinQueue,
			buildJoinQueueCalldata: build_queue_system_joinQueue_calldata,
		},
	};
}