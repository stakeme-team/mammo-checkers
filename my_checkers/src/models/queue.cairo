use starknet::ContractAddress;
use my_checkers::models::enums::GameType;

#[derive(Copy, Drop, Debug, Serde)]
#[dojo::model]
pub struct MatchQueue {
    #[key]
    pub queue_id: u8,

    pub waiting_count: u8,
    pub first_player: ContractAddress,
    pub game_type: GameType,
}
