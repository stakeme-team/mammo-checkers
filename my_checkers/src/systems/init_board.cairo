use dojo::world::WorldStorage;
use dojo::model::ModelStorage;
use crate::models::board_piece::BoardPiece;

pub fn init_classic_board(ref world: WorldStorage, match_id: u32) {
    let mut piece_id: u32 = 0;

    let row_range = array![0_u8, 1, 2];
    let col_range = array![0_u8, 1, 2, 3, 4, 5, 6, 7];

    for row in row_range.span() {
        for col in col_range.span() {
            let s: u32 = (*row).try_into().unwrap() + (*col).try_into().unwrap();
            if s % 2 == 1 {
                let bp = BoardPiece {
                    match_id: match_id.into(),
                    piece_id: piece_id.into(),
                    x: (*row).try_into().unwrap(),
                    y: (*col).try_into().unwrap(),
                    owner: 2,
                    piece_type: 2,
                };
                world.write_model(@bp);
                piece_id += 1;
            }
        }
    };

    let row_range = array![5_u8, 6, 7];

    for row in row_range.span() {
        for col in col_range.span() {
            let s: u32 = (*row).try_into().unwrap() + (*col).try_into().unwrap();
            if s % 2 == 1 {
                let bp = BoardPiece {
                    match_id: match_id.into(),
                    piece_id: piece_id.into(),
                    x: (*row).try_into().unwrap(),
                    y: (*col).try_into().unwrap(),
                    owner: 1,
                    piece_type: 1,
                };
                world.write_model(@bp);
                piece_id += 1;
            }
        }
    };
}

pub fn init_corner_board(ref world: WorldStorage, match_id: u32) {
    let mut piece_id: u32 = 0;

    let row_range = array![5_u8, 6, 7];
    let col_range = array![0_u8, 1, 2];

    for row in row_range.span() {
        for col in col_range.span() {
            let bp = BoardPiece {
                match_id: match_id.into(),
                piece_id: piece_id.into(),
                x: (*row).try_into().unwrap(),
                y: (*col).try_into().unwrap(),
                owner: 1,
                piece_type: 1,
            };
            world.write_model(@bp);
            piece_id += 1;
        }
    };

    let row_range = array![0_u8, 1, 2];
    let col_range = array![5_u8, 6, 7];

    for row in row_range.span() {
        for col in col_range.span() {
            let bp = BoardPiece {
                match_id: match_id.into(),
                piece_id: piece_id.into(),
                x: (*row).try_into().unwrap(),
                y: (*col).try_into().unwrap(),
                owner: 2,
                piece_type: 2,
            };
            world.write_model(@bp);
            piece_id += 1;
        }
    };
}