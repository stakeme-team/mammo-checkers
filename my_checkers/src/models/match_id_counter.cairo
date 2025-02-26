#[derive(Copy, Drop, Debug, Serde)]
#[dojo::model]
pub struct MatchIDCounter {
    #[key]
    pub dummy_key: u8,  
    pub next_id: u32,
}
