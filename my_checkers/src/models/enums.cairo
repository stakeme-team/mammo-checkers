#[derive(Copy, Drop, Debug, PartialEq, Serde, Introspect)]
pub enum GameType {
    CornerCheckers,
    ClassicCheckers,
}

#[derive(Copy, Drop, Debug, PartialEq, Serde, Introspect)]
pub enum GameStatus {
    NotStarted,
    Pending,
    InProgress,
    Draw,
    Finished,
    TimedOut,
    Abandoned,
}
