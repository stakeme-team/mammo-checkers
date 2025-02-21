import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, BigNumberish } from 'starknet';

type WithFieldOrder<T> = T & { fieldOrder: string[] };

// Type definition for `my_checkers::models::board_piece::BoardPiece` struct
export interface BoardPiece {
	match_id: BigNumberish;
	piece_id: BigNumberish;
	x: BigNumberish;
	y: BigNumberish;
	owner: BigNumberish;
	piece_type: BigNumberish;
}

// Type definition for `my_checkers::models::board_piece::BoardPieceValue` struct
export interface BoardPieceValue {
	x: BigNumberish;
	y: BigNumberish;
	owner: BigNumberish;
	piece_type: BigNumberish;
}

// Type definition for `my_checkers::models::game_match::GameMatch` struct
export interface GameMatch {
	match_id: BigNumberish;
	player1: string;
	player2: string;
	bet_amount: BigNumberish;
	game_type: GameTypeEnum;
	status: GameStatusEnum;
	current_turn: BigNumberish;
	chain_capture_in_progress: boolean;
	last_move_timestamp: BigNumberish;
	move_count: BigNumberish;
	winner: string;
}

// Type definition for `my_checkers::models::game_match::GameMatchValue` struct
export interface GameMatchValue {
	player1: string;
	player2: string;
	bet_amount: BigNumberish;
	game_type: GameTypeEnum;
	status: GameStatusEnum;
	current_turn: BigNumberish;
	chain_capture_in_progress: boolean;
	last_move_timestamp: BigNumberish;
	move_count: BigNumberish;
	winner: string;
}

// Type definition for `my_checkers::models::match_id_counter::MatchIDCounter` struct
export interface MatchIDCounter {
	dummy_key: BigNumberish;
	next_id: BigNumberish;
}

// Type definition for `my_checkers::models::match_id_counter::MatchIDCounterValue` struct
export interface MatchIDCounterValue {
	next_id: BigNumberish;
}

// Type definition for `my_checkers::models::player::Player` struct
export interface Player {
	player_addr: string;
	total_wins: BigNumberish;
	total_losses: BigNumberish;
}

// Type definition for `my_checkers::models::player::PlayerValue` struct
export interface PlayerValue {
	total_wins: BigNumberish;
	total_losses: BigNumberish;
}

// Type definition for `my_checkers::models::queue::MatchQueue` struct
export interface MatchQueue {
	queue_id: BigNumberish;
	waiting_count: BigNumberish;
	first_player: string;
	game_type: GameTypeEnum;
}

// Type definition for `my_checkers::models::queue::MatchQueueValue` struct
export interface MatchQueueValue {
	waiting_count: BigNumberish;
	first_player: string;
	game_type: GameTypeEnum;
}

// Type definition for `my_checkers::models::enums::GameStatus` enum
export type GameStatus = {
	NotStarted: string;
	Pending: string;
	InProgress: string;
	Draw: string;
	Finished: string;
	TimedOut: string;
	Abandoned: string;
}
export type GameStatusEnum = CairoCustomEnum;

// Type definition for `my_checkers::models::enums::GameType` enum
export type GameType = {
	CornerCheckers: string;
	ClassicCheckers: string;
}
export type GameTypeEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	my_checkers: {
		BoardPiece: WithFieldOrder<BoardPiece>,
		BoardPieceValue: WithFieldOrder<BoardPieceValue>,
		GameMatch: WithFieldOrder<GameMatch>,
		GameMatchValue: WithFieldOrder<GameMatchValue>,
		MatchIDCounter: WithFieldOrder<MatchIDCounter>,
		MatchIDCounterValue: WithFieldOrder<MatchIDCounterValue>,
		Player: WithFieldOrder<Player>,
		PlayerValue: WithFieldOrder<PlayerValue>,
		MatchQueue: WithFieldOrder<MatchQueue>,
		MatchQueueValue: WithFieldOrder<MatchQueueValue>,
	},
}
export const schema: SchemaType = {
	my_checkers: {
		BoardPiece: {
			fieldOrder: ['match_id', 'piece_id', 'x', 'y', 'owner', 'piece_type'],
			match_id: 0,
			piece_id: 0,
			x: 0,
			y: 0,
			owner: 0,
			piece_type: 0,
		},
		BoardPieceValue: {
			fieldOrder: ['x', 'y', 'owner', 'piece_type'],
			x: 0,
			y: 0,
			owner: 0,
			piece_type: 0,
		},
		GameMatch: {
			fieldOrder: ['match_id', 'player1', 'player2', 'bet_amount', 'game_type', 'status', 'current_turn', 'chain_capture_in_progress', 'last_move_timestamp', 'move_count', 'winner'],
			match_id: 0,
			player1: "",
			player2: "",
			bet_amount: 0,
		game_type: new CairoCustomEnum({ 
					CornerCheckers: "",
				ClassicCheckers: undefined, }),
		status: new CairoCustomEnum({ 
					NotStarted: "",
				Pending: undefined,
				InProgress: undefined,
				Draw: undefined,
				Finished: undefined,
				TimedOut: undefined,
				Abandoned: undefined, }),
			current_turn: 0,
			chain_capture_in_progress: false,
			last_move_timestamp: 0,
			move_count: 0,
			winner: "",
		},
		GameMatchValue: {
			fieldOrder: ['player1', 'player2', 'bet_amount', 'game_type', 'status', 'current_turn', 'chain_capture_in_progress', 'last_move_timestamp', 'move_count', 'winner'],
			player1: "",
			player2: "",
			bet_amount: 0,
		game_type: new CairoCustomEnum({ 
					CornerCheckers: "",
				ClassicCheckers: undefined, }),
		status: new CairoCustomEnum({ 
					NotStarted: "",
				Pending: undefined,
				InProgress: undefined,
				Draw: undefined,
				Finished: undefined,
				TimedOut: undefined,
				Abandoned: undefined, }),
			current_turn: 0,
			chain_capture_in_progress: false,
			last_move_timestamp: 0,
			move_count: 0,
			winner: "",
		},
		MatchIDCounter: {
			fieldOrder: ['dummy_key', 'next_id'],
			dummy_key: 0,
			next_id: 0,
		},
		MatchIDCounterValue: {
			fieldOrder: ['next_id'],
			next_id: 0,
		},
		Player: {
			fieldOrder: ['player_addr', 'total_wins', 'total_losses'],
			player_addr: "",
			total_wins: 0,
			total_losses: 0,
		},
		PlayerValue: {
			fieldOrder: ['total_wins', 'total_losses'],
			total_wins: 0,
			total_losses: 0,
		},
		MatchQueue: {
			fieldOrder: ['queue_id', 'waiting_count', 'first_player', 'game_type'],
			queue_id: 0,
			waiting_count: 0,
			first_player: "",
		game_type: new CairoCustomEnum({ 
					CornerCheckers: "",
				ClassicCheckers: undefined, }),
		},
		MatchQueueValue: {
			fieldOrder: ['waiting_count', 'first_player', 'game_type'],
			waiting_count: 0,
			first_player: "",
		game_type: new CairoCustomEnum({ 
					CornerCheckers: "",
				ClassicCheckers: undefined, }),
		},
	},
};
export enum ModelsMapping {
	BoardPiece = 'my_checkers-BoardPiece',
	BoardPieceValue = 'my_checkers-BoardPieceValue',
	GameStatus = 'my_checkers-GameStatus',
	GameType = 'my_checkers-GameType',
	GameMatch = 'my_checkers-GameMatch',
	GameMatchValue = 'my_checkers-GameMatchValue',
	MatchIDCounter = 'my_checkers-MatchIDCounter',
	MatchIDCounterValue = 'my_checkers-MatchIDCounterValue',
	Player = 'my_checkers-Player',
	PlayerValue = 'my_checkers-PlayerValue',
	MatchQueue = 'my_checkers-MatchQueue',
	MatchQueueValue = 'my_checkers-MatchQueueValue',
}