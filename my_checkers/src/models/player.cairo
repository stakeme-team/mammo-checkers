use starknet::ContractAddress;

#[derive(Copy, Drop, Debug, Serde)]
#[dojo::model]
pub struct Player {
    #[key]
    pub player_addr: ContractAddress,

    pub total_wins: u32,
    pub total_losses: u32,
}