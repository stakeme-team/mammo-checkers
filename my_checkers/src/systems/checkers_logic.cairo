use dojo::world::WorldStorage;
use dojo::model::ModelStorage;
use starknet::{get_block_timestamp, contract_address_const};
use core::array::ArrayTrait;

use crate::models::board_piece::BoardPiece;
use crate::models::game_match::GameMatch;
use crate::models::enums::{GameType, GameStatus};

pub fn execute_classic_move(
    ref world: WorldStorage,
    mut gm: GameMatch,
    mut piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> GameMatch {
    let (is_capture, is_king_move) = validate_classic_move(ref world, gm, piece, to_x, to_y);
    
    if is_capture {
        println!("execute capture");
        remove_captured_piece(ref world, gm.match_id, piece.x, piece.y, to_x, to_y, is_king_move);
    }
    
    piece.x = to_x;
    piece.y = to_y;
    
    piece = maybe_promote_classic_king(piece);

    world.write_model(@piece);

    if is_capture {
        let can_continue = can_piece_capture_more_classic(ref world, gm.match_id, piece);
        if can_continue {
            gm.chain_capture_in_progress = true;
            return gm;
        }
    }

    gm.chain_capture_in_progress = false;
    gm.current_turn = if gm.current_turn == 1_u8 { 2_u8 } else { 1_u8 };
    gm.last_move_timestamp = get_block_timestamp();
    gm
}


pub fn execute_corner_multi_moves(
    ref world: WorldStorage,
    mut gm: GameMatch,
    steps: Array::<CornerStep>
) -> GameMatch {
    let steps_span = steps.span();
    let steps_len = steps_span.len();
    assert!(steps_len > 0, "No steps provided");

    let first_step = *steps_span.at(0);
    let piece_opt = find_piece_by_coords(ref world, gm.match_id, first_step.from_x, first_step.from_y);
    assert!(piece_opt.is_some(), "No piece at the initial from_x, from_y");
    let mut piece = piece_opt.unwrap();

    assert!(piece.owner == gm.current_turn, "This piece does not belong to the current player");

    let mut current_x = piece.x;
    let mut current_y = piece.y;

    let mut i: u32 = 0;
    while i < steps_len {
        let step = *steps_span.at(i);
        i += 1;

        assert!(
            step.from_x == current_x && step.from_y == current_y,
            "All steps must use the same piece"
        );

        let (_is_jump, _dist) = validate_corner_move(ref world, gm, piece, step.to_x, step.to_y);

        piece.x = step.to_x;
        piece.y = step.to_y;
        world.write_model(@piece);

        current_x = step.to_x;
        current_y = step.to_y;
    };

    gm.move_count += 1;
    gm.current_turn = if gm.current_turn == 1_u8 { 2_u8 } else { 1_u8 };
    gm.last_move_timestamp = get_block_timestamp();

    gm
}

pub fn check_winner_or_draw(ref world: WorldStorage, mut gm: GameMatch) -> GameMatch {
    if gm.game_type == GameType::ClassicCheckers {
        gm = check_classic_winner(ref world, gm);
    } else {
        gm = check_corner_winner(ref world, gm);
    }
    gm
}

fn check_classic_winner(ref world: WorldStorage, mut gm: GameMatch) -> GameMatch {
    let (count1, count2) = count_pieces(ref world, gm.match_id);
    println!("check win classic countf {:?}", count1);
    println!("check win classic counts {:?}", count2);
    if count1 == 0_u32 || count2 == 0_u32 {
        gm.status = GameStatus::Finished;
        if count1 == 0 {
            gm.winner = gm.player2;
        } else if count2 == 0 {
            gm.winner = gm.player1;
        }
        return gm;
    }
    gm
}

fn check_corner_winner(ref world: WorldStorage, mut gm: GameMatch) -> GameMatch {
    let (count1, count2) = count_pieces(ref world, gm.match_id);
    if count1 == 0_u32 || count2 == 0_u32 {
        gm.status = GameStatus::Finished;
        if count1 == 0 {
            gm.winner = gm.player2;
        } else if count2 == 0 {
            gm.winner = gm.player1;
        }
        return gm;
    }
    let p1_in_enemy = check_p1_in_enemy_corner(ref world, gm.match_id);
    if p1_in_enemy == 9_u32 {
        gm.status = GameStatus::Finished;
        gm.winner = gm.player1;
        return gm;
    }
    let p2_in_enemy = check_p2_in_enemy_corner(ref world, gm.match_id);
    if p2_in_enemy == 9_u32 {
        gm.status = GameStatus::Finished;
        gm.winner = gm.player2;
        return gm;
    }
    if gm.move_count == 160_u32 {
        let c_p1 = check_p1_in_enemy_corner(ref world, gm.match_id);
        let c_p2 = check_p2_in_enemy_corner(ref world, gm.match_id);
        if c_p1 > c_p2 {
            gm.status = GameStatus::Finished; 
            gm.winner = gm.player1;
        } else if c_p2 > c_p1 {
            gm.status = GameStatus::Finished; 
            gm.winner = gm.player2;
        } else {
            gm.status = GameStatus::Draw;
            gm.winner = contract_address_const::<0>(); 
        }
        return gm;
    }
    gm
}


fn check_p1_in_enemy_corner(ref world: WorldStorage, match_id: u32) -> u32 {
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let mut count: u32 = 0;
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;
    while i < len {
        let pid = *span.at(i);
        let bp: BoardPiece = world.read_model((match_id, pid));
        if bp.owner == 1_u8 && bp.x >= 5_u8 && bp.y >= 5_u8 {
            count += 1;
        }
        i += 1;
    };
    count
}

fn check_p2_in_enemy_corner(ref world: WorldStorage, match_id: u32) -> u32 {
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let mut count: u32 = 0;
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;
    while i < len {
        let pid = *span.at(i);
        let bp: BoardPiece = world.read_model((match_id, pid));
        if bp.owner == 2_u8 && bp.x <= 2_u8 && bp.y <= 2_u8 {
            count += 1;
        }
        i += 1;
    };
    count
}

pub fn validate_classic_move(
    ref world: WorldStorage,
    gm: GameMatch,
    piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> (bool, bool) { 
    if to_x > 7_u8 || to_y > 7_u8 {
        assert!(false, "Invalid move: Destination coordinates out of bounds");
    }

    let dest_opt = find_piece_by_coords(ref world, piece.match_id, to_x, to_y);
    assert!(dest_opt.is_none(), "Invalid move: Destination square is occupied");

    let dx = if to_x > piece.x { to_x - piece.x } else { piece.x - to_x };
    let dy = if to_y > piece.y { to_y - piece.y } else { piece.y - to_y };

    let is_king = (piece.piece_type == 3_u8) || (piece.piece_type == 4_u8);
    
    if gm.chain_capture_in_progress {
        let must_continue_piece = find_piece_that_must_continue(ref world, gm.match_id, gm.current_turn);
        assert!(must_continue_piece.is_some(), "Invalid move: No valid capturing piece found.");

        let required_piece = must_continue_piece.unwrap();
        assert!(
            piece.x == required_piece.x && piece.y == required_piece.y,
            "Invalid move: You must continue capturing with the same piece."
        );
    } else {
        if !is_king {
            let is_capture = dx == 2_u8 && dy == 2_u8;

            if !is_capture {
                if piece.owner == 1_u8 {
                    assert!(to_x < piece.x, "Invalid move: Player 1 non-king must move upwards (to_x must be less than current x)");
                } else {
                    assert!(to_x > piece.x, "Invalid move: Player 2 non-king must move downwards (to_x must be greater than current x)");
                }
            }
        }
    }

    if !is_king {
        assert!(dx == dy, "Invalid move: Move must be diagonal (dx must equal dy)");
        if dx == 1_u8 {
            return (false, false); 
        } else if dx == 2_u8 {
            let mid_x = (piece.x + to_x) / 2;
            let mid_y = (piece.y + to_y) / 2;
            let mid_opt = find_piece_by_coords(ref world, piece.match_id, mid_x, mid_y);
            assert!(mid_opt.is_some(), "Invalid capture: No piece found in the middle square to capture");
            let mid_piece = mid_opt.unwrap();
            assert!(mid_piece.owner != piece.owner, "Invalid capture: Cannot capture your own piece");
            return (true, false); 
        } else {
            assert!(false, "Invalid move: Move distance not allowed for a non-king piece");
        }
    } else {
        assert!(dx == dy, "Invalid move: King must move diagonally (dx must equal dy)");
        let is_cap = is_king_capture(ref world, piece, to_x, to_y);
        return (is_cap, true); 
    }
    (false, false) 
}


pub fn is_king_capture(
    ref world: WorldStorage,
    piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> bool {
    let mut count_enemy: u8 = 0;
    let mut x = piece.x;
    let mut y = piece.y;
    let step_x: i8 = if to_x > piece.x { 1 } else { -1 };
    let step_y: i8 = if to_y > piece.y { 1 } else { -1 };

    println!("Starting position x: {:?}, y: {:?}", x, y);
    println!("Target position x: {:?}, y: {:?}", to_x, to_y);

    while x != to_x && y != to_y {
        x = (x.try_into().unwrap() + step_x).try_into().unwrap();
        y = (y.try_into().unwrap() + step_y).try_into().unwrap();

        let mid_opt = find_piece_by_coords(ref world, piece.match_id, x, y);

        if mid_opt.is_some() {
            let midp = mid_opt.unwrap();
            assert!(midp.owner != piece.owner, "Error: A king cannot capture its own piece");

            count_enemy += 1;

            assert!(count_enemy <= 1, "Error: There are more than one piece to capture on the path");
            continue; 
        }
    };

    println!("Number of enemy pieces captured on the path: {:?}", count_enemy);
    count_enemy == 1
}

pub fn can_piece_capture_more_classic(
    ref world: WorldStorage,
    match_id: u32,
    piece: BoardPiece
) -> bool {
    let directions = array![
        (-1_i8, -1_i8),
        (-1_i8, 1_i8),
        (1_i8, -1_i8),
        (1_i8, 1_i8)
    ];

    let mut can_continue: bool = false; 
    let mut i: u32 = 0;
    let len = directions.span().len();

    println!("can_piece_capture_more_classic");

    while i < len {
        let (dx, dy) = *directions.span().at(i);
        i += 1;

        let mid_x_i8 = piece.x.try_into().unwrap() + dx;
        let mid_y_i8 = piece.y.try_into().unwrap() + dy;

        if mid_x_i8 < 0 || mid_x_i8 > 7 || mid_y_i8 < 0 || mid_y_i8 > 7 {
            continue;
        }

        let mid_x = mid_x_i8.try_into().unwrap();
        let mid_y = mid_y_i8.try_into().unwrap();

        let mid_opt = find_piece_by_coords(ref world, match_id, mid_x, mid_y);
        if mid_opt.is_none() {
            continue;
        }

        let mid_piece = mid_opt.unwrap();

        if mid_piece.owner == piece.owner {
            continue;
        }

        let to_x_i8 = piece.x.try_into().unwrap() + 2 * dx;
        let to_y_i8 = piece.y.try_into().unwrap() + 2 * dy;

        if to_x_i8 < 0 || to_x_i8 > 7 || to_y_i8 < 0 || to_y_i8 > 7 {
            continue;
        }

        let to_x = to_x_i8.try_into().unwrap();
        let to_y = to_y_i8.try_into().unwrap();

        let dest_opt = find_piece_by_coords(ref world, match_id, to_x, to_y);
        if dest_opt.is_none() {
            can_continue = true;
            break; 
        }
    };

    can_continue 
}

pub fn maybe_promote_classic_king(piece: BoardPiece) -> BoardPiece {
    let mut p = piece;
    if p.owner == 1_u8 && p.x == 0_u8 && p.piece_type == 1_u8 {
        p.piece_type = 3_u8;
    } else if p.owner == 2_u8 && p.x == 7_u8 && p.piece_type == 2_u8 {
        p.piece_type = 4_u8;
    }
    p
}

pub fn validate_corner_move(
    ref world: WorldStorage,
    gm: GameMatch,  
    piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> (bool, u8) {
    if to_x > 7_u8 || to_y > 7_u8 {
        assert!(false, "Invalid move: Destination out of bounds");
    }

    let dest_opt = find_piece_by_coords(ref world, piece.match_id, to_x, to_y);
    assert!(dest_opt.is_none(), "Invalid move: Destination occupied");

    let dx = if to_x > piece.x { to_x - piece.x } else { piece.x - to_x };
    let dy = if to_y > piece.y { to_y - piece.y } else { piece.y - to_y };

    if (dx == 1_u8 && dy == 0_u8) || (dx == 0_u8 && dy == 1_u8) {
        return (false, 1_u8);
    }

    if (dx == 2_u8 && dy == 0_u8) || (dx == 0_u8 && dy == 2_u8) {
        let mid_x = (piece.x + to_x) / 2;
        let mid_y = (piece.y + to_y) / 2;

        let mid_opt = find_piece_by_coords(ref world, piece.match_id, mid_x, mid_y);
        assert!(
            mid_opt.is_some(),
            "Invalid jump: No piece found in the middle to jump over"
        );

        return (true, 2_u8);
    }

    assert!(
        false,
        "Invalid corner move: must step (1 cell) or jump (2 cells) vertically/horizontally"
    );
    (false, 0_u8) // unreachable
}

pub fn find_piece_that_must_continue(
    ref world: WorldStorage,
    match_id: u32,
    current_turn: u8
) -> Option<BoardPiece> {
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;

    let mut found_piece: Option<BoardPiece> = Option::None(()); 
    println!("find_piece_tmc");

    while i < len {
        let pid = *span.at(i);
        let piece: BoardPiece = world.read_model((match_id, pid));

        if piece.owner == current_turn {
            let can_continue = can_piece_capture_more_classic(ref world, match_id, piece);

            if can_continue {
                println!("can continue {:?}", can_continue);
                found_piece = Option::Some(piece);
                break; 
            }
        }

        i += 1;
    };

    found_piece 
}

pub fn remove_captured_piece(
    ref world: WorldStorage,
    match_id: u32,
    from_x: u8,
    from_y: u8,
    to_x: u8,
    to_y: u8,
    is_king_move: bool 
) {
    if !is_king_move {
        let mid_x: u8 = (from_x + to_x) / 2;
        let mid_y: u8 = (from_y + to_y) / 2;
        let captured_opt = find_piece_by_coords(ref world, match_id, mid_x, mid_y);
        
        if captured_opt.is_some() {
            let captured = captured_opt.unwrap();
            println!("Removing captured piece at ({}, {})", mid_x, mid_y);
            world.erase_model(@captured);
        } else {
            println!("No piece to capture at ({}, {})", mid_x, mid_y);
        }
    } else {
        let dx: i8 = if to_x > from_x { 1 } else { -1 };
        let dy: i8 = if to_y > from_y { 1 } else { -1 };
        let mut x: i8 = from_x.try_into().unwrap();
        let mut y: i8 = from_y.try_into().unwrap();
        
        let mut captured_found = false; 
        
        while x != to_x.try_into().unwrap() && y != to_y.try_into().unwrap() {
            x += dx;
            y += dy;

            let mid_x: u8 = x.try_into().unwrap();
            let mid_y: u8 = y.try_into().unwrap();
            
            let mid_opt = find_piece_by_coords(ref world, match_id, mid_x, mid_y);
            
            if mid_opt.is_some() {
                let mid_piece = mid_opt.unwrap();
                if mid_piece.owner != from_x {
                    println!("Removing captured piece at ({}, {})", mid_x, mid_y);
                    world.erase_model(@mid_piece);
                    captured_found = true; 
                }
            }
        };
        if !captured_found {
            println!("No valid piece found to capture");
        }
    }
}


fn count_pieces(ref world: WorldStorage, match_id: u32) -> (u32, u32) {
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let mut count_p1: u32 = 0;
    let mut count_p2: u32 = 0;
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;
    while i < len {
        let pid = *span.at(i);
        let bp: BoardPiece = world.read_model((match_id, pid));
        if bp.owner == 1_u8 { count_p1 += 1; }
        if bp.owner == 2_u8 { count_p2 += 1; }
        i += 1;
    };
    (count_p1, count_p2)
}

pub fn get_all_piece_ids_for_match(ref world: WorldStorage, match_id: u32) -> Array::<u32> {
    let mut result = ArrayTrait::<u32>::new();
    let max_pieces: u32 = 24_u32;
    let mut i: u32 = 0;
    while i < max_pieces {
        let bp: BoardPiece = world.read_model((match_id, i));
        if bp.owner != 0_u8 {
            result.append(i);
        }
        i += 1;
    };
    result
}

pub fn find_piece_by_coords(
    ref world: WorldStorage,
    match_id: u32,
    fx: u8,
    fy: u8
) -> Option<BoardPiece> {
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let span = piece_ids.span();
    let len = span.len();
    let mut found: Option<BoardPiece> = Option::None(());
    let mut i: u32 = 0;
    while i < len {
        let pid = *span.at(i);
        let bp: BoardPiece = world.read_model((match_id, pid));
        if bp.x == fx && bp.y == fy && bp.owner != 0_u8 {
            found = Option::Some(bp);
            break;
        }
        i += 1;
    };
    found
}

#[derive(Copy, Drop, Serde)]
pub struct CornerStep {
    pub from_x: u8,
    pub from_y: u8,
    pub to_x: u8,
    pub to_y: u8,
}