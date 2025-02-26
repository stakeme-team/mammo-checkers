use starknet::ContractAddress;

#[derive(Drop, Serde, Copy)]
#[dojo::model]
pub struct BoardPiece {
    #[key]
    pub match_id: u32,     
    #[key]
    pub piece_id: u32,      
    pub x: u8,              
    pub y: u8,
    pub owner: u8,          
    pub piece_type: u8,     
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct MoveMade {
    #[key]
    pub match_id: u32,
    pub player: ContractAddress,
    pub from_x: u8,
    pub from_y: u8,
    pub to_x: u8,
    pub to_y: u8,
}
