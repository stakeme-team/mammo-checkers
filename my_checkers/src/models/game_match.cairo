use starknet::ContractAddress;
use crate::models::enums::{GameType, GameStatus};

#[derive(Copy, Drop, Debug, Serde)]
#[dojo::model]
pub struct GameMatch {
    #[key]
    pub match_id: u32,

    pub player1: ContractAddress,
    pub player2: ContractAddress,
    pub bet_amount: u128,

    pub game_type: GameType,
    pub status: GameStatus,

    pub current_turn: u8,
    pub chain_capture_in_progress: bool,

    pub last_move_timestamp: u64,

    pub move_count: u32,  // счётчик ходов

    pub winner: ContractAddress,
    // draw_offered_by_p1: bool,
    // draw_offered_by_p2: bool,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct MatchCreated {
    #[key]
    pub match_id: u32,
    pub player1: ContractAddress,
    pub player2: ContractAddress,
    pub status: GameStatus,
    pub game_type: GameType,
}
