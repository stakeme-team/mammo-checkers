use dojo::world::WorldStorage;
use dojo::model::ModelStorage;
use starknet::{get_block_timestamp, contract_address_const};
use core::array::ArrayTrait;

use crate::models::board_piece::BoardPiece;
use crate::models::game_match::GameMatch;
use crate::models::enums::{GameType, GameStatus};

/// Выполняет ход в классических шашках.
/// Параметры:
/// - world: доступ к хранилищу моделей;
/// - gm: текущая партия (GameMatch);
/// - piece: фигура (BoardPiece), которая будет перемещаться;
/// - to_x, to_y: целевые координаты для хода.
pub fn execute_classic_move(
    ref world: WorldStorage,
    mut gm: GameMatch,
    mut piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> GameMatch {
    // Проверяем корректность хода (обычный или удар) согласно правилам классических шашек.
    let (is_capture, _nsteps) = validate_classic_move(ref world, gm, piece, to_x, to_y);
    if is_capture {
        println!("execute capture");
        // Если ход является ударом, удаляем захваченную фигуру с доски.
        remove_captured_piece(ref world, gm.match_id, piece.x, piece.y, to_x, to_y);
    }
    // Обновляем координаты фигуры согласно выбранному ходу.
    println!("update x_old {:?}", piece.x);
    println!("update y_old {:?}", piece.y);
    piece.x = to_x;
    piece.y = to_y;
    
    println!("update x_n {:?}", to_x);
    println!("update y_n {:?}", to_y);
    // Если фигура достигает крайней горизонтали, она может быть превращена в дамку.
    piece = maybe_promote_classic_king(piece);
    // Сохраняем обновлённое состояние фигуры в хранилище.
    world.write_model(@piece);
    // Если ход был ударным, проверяем, может ли игрок продолжать серию ударов.
    if is_capture {
        println!("exec capture2");
        let can_continue = can_piece_capture_more_classic(ref world, gm.match_id, piece);
        println!("exec capture3 {:?}", can_continue);
        if can_continue {
            gm.chain_capture_in_progress = true;
            return gm;
        }
    }
    // Если удар не продолжается, смена хода: передаём право хода противнику.
    gm.chain_capture_in_progress = false;
    gm.current_turn = if gm.current_turn == 1_u8 { 2_u8 } else { 1_u8 };
    // Обновляем время последнего хода.
    gm.last_move_timestamp = get_block_timestamp();
    gm
}

/// Обрабатывает несколько ходов (шагов/прыжков) подряд за одного игрока в уголках,
/// но не переключает ход каждый раз, а лишь в конце всей серии.
/// Возвращаем обновлённый gm (с учётом всех ходов).
pub fn execute_corner_multi_moves(
    ref world: WorldStorage,
    mut gm: GameMatch,
    steps: Array::<CornerStep>
) -> GameMatch {
    let steps_span = steps.span();
    let steps_len = steps_span.len();
    assert!(steps_len > 0, "No steps provided");

    // 1) Берём первый шаг
    let first_step = *steps_span.at(0);
    let piece_opt = find_piece_by_coords(ref world, gm.match_id, first_step.from_x, first_step.from_y);
    assert!(piece_opt.is_some(), "No piece at the initial from_x, from_y");
    let mut piece = piece_opt.unwrap();

    // Проверяем владельца
    assert!(piece.owner == gm.current_turn, "This piece does not belong to the current player");

    // Сохраняем в локальные переменные текущее положение активной шашки
    let mut current_x = piece.x;
    let mut current_y = piece.y;

    // 2) Цикл по всем шагам
    let mut i: u32 = 0;
    while i < steps_len {
        let step = *steps_span.at(i);
        i += 1;

        // 2.1) Проверяем, что from_x/from_y == (current_x/current_y)
        //      если кто-то пытается передвинуть другую шашку, откатываем
        assert!(
            step.from_x == current_x && step.from_y == current_y,
            "All steps must use the same piece"
        );

        // 2.2) Вызываем validate_corner_move, чтобы проверить корректность (шаг/прыжок)
        let (_is_jump, _dist) = validate_corner_move(ref world, gm, piece, step.to_x, step.to_y);

        // 2.3) Обновляем координаты активной шашки
        piece.x = step.to_x;
        piece.y = step.to_y;
        world.write_model(@piece);

        // 2.4) Обновляем current_x/current_y
        current_x = step.to_x;
        current_y = step.to_y;
    };

    // 3) По завершении всех шагов — переключаем ход
    gm.move_count += 1;
    gm.current_turn = if gm.current_turn == 1_u8 { 2_u8 } else { 1_u8 };
    gm.last_move_timestamp = get_block_timestamp();

    gm
}

/// Определяет, завершилась ли партия (например, один из игроков не имеет фигур или не может ходить).
/// Вызывает соответствующую проверку в зависимости от типа игры (классические шашки или уголки).
/// Проверяем, не закончилась ли партия (нет фигур / занял углы / move_count=160 / и т.д.).
/// Возвращаем обновлённый gm (возможно, изменён status = Finished/Draw).
pub fn check_winner_or_draw(ref world: WorldStorage, mut gm: GameMatch) -> GameMatch {
    if gm.game_type == GameType::ClassicCheckers {
        gm = check_classic_winner(ref world, gm);
    } else {
        gm = check_corner_winner(ref world, gm);
    }
    gm
}

/// Проверка победителя в классических шашках.
/// Если у одного из игроков не осталось фигур или игрок не может сделать ход, игра завершается.
fn check_classic_winner(ref world: WorldStorage, mut gm: GameMatch) -> GameMatch {
    let (count1, count2) = count_pieces(ref world, gm.match_id);
    println!("check win classic countf {:?}", count1);
    println!("check win classic counts {:?}", count2);
    if count1 == 0_u32 || count2 == 0_u32 {
        gm.status = GameStatus::Finished;
        // Если у игрока 1 не осталось фигур, выигрывает игрок 2, и наоборот.
        if count1 == 0 {
            gm.winner = gm.player2;
        } else if count2 == 0 {
            gm.winner = gm.player1;
        }
        return gm;
    }
    // Проверяем, может ли текущий игрок ходить
    // let can_move = can_player_move(ref world, gm);
    // println!("check win classic cmove {:?}", can_move);
    // if !can_move {
    //     gm.status = GameStatus::Finished;
    // }
    gm
}


/// Проверка победителя в игре уголки.
/// Дополнительно проверяется, находятся ли достаточное количество фигур в доме противника.
/// Также учитывается максимальное число ходов.
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
    // Если у p1 (игрок 1) все фигуры находятся в доме противника.
    let p1_in_enemy = check_p1_in_enemy_corner(ref world, gm.match_id);
    if p1_in_enemy == 9_u32 {
        gm.status = GameStatus::Finished;
        gm.winner = gm.player1;
        return gm;
    }
    // Аналогично для игрока 2.
    let p2_in_enemy = check_p2_in_enemy_corner(ref world, gm.match_id);
    if p2_in_enemy == 9_u32 {
        gm.status = GameStatus::Finished;
        gm.winner = gm.player2;
        return gm;
    }
    // Если достигнут лимит ходов, определяем победителя по количеству фигур в доме.
    if gm.move_count == 160_u32 {
        let c_p1 = check_p1_in_enemy_corner(ref world, gm.match_id);
        let c_p2 = check_p2_in_enemy_corner(ref world, gm.match_id);
        if c_p1 > c_p2 {
            gm.status = GameStatus::Finished; // победа p1
            gm.winner = gm.player1;
        } else if c_p2 > c_p1 {
            gm.status = GameStatus::Finished; // победа p2
            gm.winner = gm.player2;
        } else {
            gm.status = GameStatus::Draw;
            gm.winner = contract_address_const::<0>(); // ничья – победителя нет.
        }
        return gm;
    }
    // Если игрок не может сделать ход, считаем, что он проиграл.
    // if !can_player_move(ref world, gm) {
    //     gm.status = GameStatus::Finished;
    //     if gm.current_turn == 1 {
    //         gm.winner = gm.player2;
    //     } else {
    //         gm.winner = gm.player1;
    //     }
    // }
    gm
}


/// Подсчитывает количество фигур игрока 1, находящихся в доме противника (координаты x=5..7, y=5..7).
fn check_p1_in_enemy_corner(ref world: WorldStorage, match_id: u32) -> u32 {
    // Получаем все идентификаторы фигур для данной партии.
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let mut count: u32 = 0;
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;
    // Перебираем все фигуры и считаем те, что удовлетворяют условию.
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

/// Подсчитывает количество фигур игрока 2, находящихся в доме противника (координаты x=0..2, y=0..2).
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

/// Проверка допустимости хода для классических шашек.
/// Здесь проверяется, что ход по диагонали соответствует правилам, а также,
/// если ход ударный (перепрыгивание через фигуру), то проверяется наличие вражеской фигуры посередине.
pub fn validate_classic_move(
    ref world: WorldStorage,
    gm: GameMatch,
    piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> (bool, u8) {
    // Проверяем, что целевая клетка в пределах доски (0-7)
    if to_x > 7_u8 || to_y > 7_u8 {
        assert!(false, "Invalid move: Destination coordinates out of bounds");
    }
    // Проверяем, что целевая клетка пуста
    let dest_opt = find_piece_by_coords(ref world, piece.match_id, to_x, to_y);
    assert!(dest_opt.is_none(), "Invalid move: Destination square is occupied");

    let dx = if to_x > piece.x { to_x - piece.x } else { piece.x - to_x };
    let dy = if to_y > piece.y { to_y - piece.y } else { piece.y - to_y };
    println!("dx {:?}", dx);
    println!("dy {:?}", dy);

    let is_king = (piece.piece_type == 3_u8) || (piece.piece_type == 4_u8);
    
    if gm.chain_capture_in_progress {
        println!("ischaincapt");
        let must_continue_piece = find_piece_that_must_continue(ref world, gm.match_id, gm.current_turn);
        println!("mst_continue");
        assert!(must_continue_piece.is_some(), "Invalid move: No valid capturing piece found.");

        let required_piece = must_continue_piece.unwrap();
        assert!(
            piece.x == required_piece.x && piece.y == required_piece.y,
            "Invalid move: You must continue capturing with the same piece."
        );
    } else {
        if !is_king {
            // Проверяем, является ли ход ударным
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

    println!("is_king ques");
    if !is_king {
        println!("is_king false");
        println!("assert dx eq dy");
        assert!(dx == dy, "Invalid move: Move must be diagonal (dx must equal dy)");
        if dx == 1_u8 {
            println!("non capture");
            // Обычный (не ударный) ход.
            return (false, 1_u8);
        } else if dx == 2_u8 {
            println!("capture");
            // Ударный ход: вычисляем среднюю клетку между началом и концом хода.
            let mid_x = (piece.x + to_x) / 2;
            let mid_y = (piece.y + to_y) / 2;
            let mid_opt = find_piece_by_coords(ref world, piece.match_id, mid_x, mid_y);
            assert!(mid_opt.is_some(), "Invalid capture: No piece found in the middle square to capture");
            let mid_piece = mid_opt.unwrap();
            assert!(mid_piece.owner != piece.owner, "Invalid capture: Cannot capture your own piece");
            return (true, 2_u8);
        } else {
            assert!(false, "Invalid move: Move distance not allowed for a non-king piece");
        }
    } else {
        println!("is_king:true");
        assert!(dx == dy, "Invalid move: King must move diagonally (dx must equal dy)");
        let is_cap = is_king_capture(ref world, piece, to_x, to_y);
        return (is_cap, dx);
    }
    (false, 0_u8)
}

/// Проверяет, является ли ход дамки ударным.
/// Функция идёт по диагонали от начальной позиции до целевой, суммируя количество встреченных фигур.
/// Если встречена ровно одна вражеская фигура – ход является ударным.
pub fn is_king_capture(
    ref world: WorldStorage,
    piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> bool {
    let mut count_enemy: u8 = 0;
    let mut x = piece.x;
    let mut y = piece.y;
    // Определяем направление движения по x и y.
    let step_x: i8 = if to_x > piece.x { 1 } else { -1 };
    let step_y: i8 = if to_y > piece.y { 1 } else { -1 };
    // Проходим по диагонали до целевой клетки.
    while x != to_x && y != to_y {
        // Приводим x и y к типу i8, прибавляем шаг и затем обратно к u8.
        x = (x.try_into().unwrap() + step_x).try_into().unwrap();
        y = (y.try_into().unwrap() + step_y).try_into().unwrap();
        let mid_opt = find_piece_by_coords(ref world, piece.match_id, x, y);
        if mid_opt.is_some() {
            let midp = mid_opt.unwrap();
            // Убедимся, что встреченная шашка принадлежит противнику.
            assert!(midp.owner != piece.owner, "Invalid king capture: Encountered your own piece during capture path");
            count_enemy += 1;
        }
        // Если количество встреченных шашек превышает 1 – ошибка.
        assert!(count_enemy <= 1, "Invalid king move: More than one enemy piece encountered in the path");
    };
    count_enemy == 1_u8
}

/// Проверка возможности продолжения серии ударов для классических шашек.
pub fn can_piece_capture_more_classic(
    ref world: WorldStorage,
    match_id: u32,
    piece: BoardPiece
) -> bool {
    // Возможные направления удара: вверх-влево, вверх-вправо, вниз-влево, вниз-вправо.
    let directions = array![
        (-1_i8, -1_i8),
        (-1_i8, 1_i8),
        (1_i8, -1_i8),
        (1_i8, 1_i8)
    ];

    let mut can_continue: bool = false; // Флаг, указывающий, есть ли возможность продолжить взятие
    let mut i: u32 = 0;
    let len = directions.span().len();

    println!("can_piece_capture_more_classic");

    while i < len {
        let (dx, dy) = *directions.span().at(i);
        i += 1;

        // Вычисляем координаты средней клетки
        let mid_x_i8 = piece.x.try_into().unwrap() + dx;
        let mid_y_i8 = piece.y.try_into().unwrap() + dy;

        // Проверяем, не выходит ли средняя клетка за границы доски (0-7)
        if mid_x_i8 < 0 || mid_x_i8 > 7 || mid_y_i8 < 0 || mid_y_i8 > 7 {
            continue;
        }

        let mid_x = mid_x_i8.try_into().unwrap();
        let mid_y = mid_y_i8.try_into().unwrap();

        // Проверяем, есть ли шашка соперника в средней точке
        let mid_opt = find_piece_by_coords(ref world, match_id, mid_x, mid_y);
        if mid_opt.is_none() {
            continue;
        }

        let mid_piece = mid_opt.unwrap();

        // Проверяем, что это шашка соперника
        if mid_piece.owner == piece.owner {
            continue;
        }

        // Вычисляем координаты клетки после прыжка
        let to_x_i8 = piece.x.try_into().unwrap() + 2 * dx;
        let to_y_i8 = piece.y.try_into().unwrap() + 2 * dy;

        // Проверяем, не выходит ли конечная клетка за границы доски (0-7)
        if to_x_i8 < 0 || to_x_i8 > 7 || to_y_i8 < 0 || to_y_i8 > 7 {
            continue;
        }

        let to_x = to_x_i8.try_into().unwrap();
        let to_y = to_y_i8.try_into().unwrap();

        // Проверяем, что конечная клетка свободна
        let dest_opt = find_piece_by_coords(ref world, match_id, to_x, to_y);
        if dest_opt.is_none() {
            can_continue = true;
            break; // Выходим из цикла, если нашли возможность продолжения удара
        }
    };

    can_continue // Возвращаем результат после выхода из цикла
}

/// Коронация обычной шашки в дамку.
/// Если фигура достигает крайней горизонтали, она становится дамкой.
/// Для игрока 1 – верхняя горизонталь (x == 0), для игрока 2 – нижняя (x == 7).
pub fn maybe_promote_classic_king(piece: BoardPiece) -> BoardPiece {
    let mut p = piece;
    if p.owner == 1_u8 && p.x == 0_u8 && p.piece_type == 1_u8 {
        p.piece_type = 3_u8;
    } else if p.owner == 2_u8 && p.x == 7_u8 && p.piece_type == 2_u8 {
        p.piece_type = 4_u8;
    }
    p
}

/// Возвращаем (is_jump, distance),
/// - is_jump = true, если это прыжок (2 клетки),
/// - is_jump = false, если это шаг (1 клетка).
/// - Для уголков ходим только по 4 направлениям (вверх/вниз/влево/вправо).
pub fn validate_corner_move(
    ref world: WorldStorage,
    gm: GameMatch,  // gm не особо нужен, если не проверяем chain
    piece: BoardPiece,
    to_x: u8,
    to_y: u8
) -> (bool, u8) {
    // 1) Проверяем, что целевые координаты в пределах 0..7
    if to_x > 7_u8 || to_y > 7_u8 {
        assert!(false, "Invalid move: Destination out of bounds");
    }

    // 2) Проверяем, что целевая клетка свободна
    let dest_opt = find_piece_by_coords(ref world, piece.match_id, to_x, to_y);
    assert!(dest_opt.is_none(), "Invalid move: Destination occupied");

    // 3) Считаем dx, dy
    let dx = if to_x > piece.x { to_x - piece.x } else { piece.x - to_x };
    let dy = if to_y > piece.y { to_y - piece.y } else { piece.y - to_y };

    // Разрешаем ходы только по вертикали/горизонтали, значит
    // либо dx>0, dy=0, либо dx=0, dy>0.

    // a) Шаг на 1 клетку (dx=1, dy=0) или (dx=0, dy=1)
    if (dx == 1_u8 && dy == 0_u8) || (dx == 0_u8 && dy == 1_u8) {
        return (false, 1_u8);
    }

    // b) Прыжок на 2 клетки (dx=2,dy=0) или (dx=0,dy=2)
    //    + проверяем, что посредине есть фигура (любая).
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

    // Если не попали ни в шаг, ни в прыжок — ошибка
    assert!(
        false,
        "Invalid corner move: must step (1 cell) or jump (2 cells) vertically/horizontally"
    );
    (false, 0_u8) // unreachable
}

/// Находит шашку, которая должна продолжать цепное взятие.
pub fn find_piece_that_must_continue(
    ref world: WorldStorage,
    match_id: u32,
    current_turn: u8
) -> Option<BoardPiece> {
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;

    let mut found_piece: Option<BoardPiece> = Option::None(()); // Переменная-флаг
    println!("find_piece_tmc");

    while i < len {
        let pid = *span.at(i);
        let piece: BoardPiece = world.read_model((match_id, pid));

        if piece.owner == current_turn {
            let can_continue = can_piece_capture_more_classic(ref world, match_id, piece);

            if can_continue {
                println!("can continue {:?}", can_continue);
                found_piece = Option::Some(piece);
                break; // Прерываем, если нашли шашку, которая может продолжить взятие
            }
        }

        i += 1;
    };

    found_piece // Возвращаем переменную после завершения цикла
}

/// Удаление побитой фигуры с доски.
/// Определяются координаты средней клетки между началом и концом хода, и если там есть фигура, она удаляется.
pub fn remove_captured_piece(
    ref world: WorldStorage,
    match_id: u32,
    from_x: u8,
    from_y: u8,
    to_x: u8,
    to_y: u8
) {
    let mid_x = (from_x + to_x) / 2;
    let mid_y = (from_y + to_y) / 2;
    let captured_opt = find_piece_by_coords(ref world, match_id, mid_x, mid_y);
    if captured_opt.is_some() {
        let captured = captured_opt.unwrap();
        world.erase_model(@captured);
    }
}

/// Подсчитывает количество шашек на доске для данной партии.
/// Возвращается кортеж: (количество шашек игрока 1, количество шашек игрока 2).
fn count_pieces(ref world: WorldStorage, match_id: u32) -> (u32, u32) {
    let piece_ids = get_all_piece_ids_for_match(ref world, match_id);
    let mut count_p1: u32 = 0;
    let mut count_p2: u32 = 0;
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;
    // Перебор всех идентификаторов фигур и суммирование по владельцу.
    while i < len {
        let pid = *span.at(i);
        let bp: BoardPiece = world.read_model((match_id, pid));
        if bp.owner == 1_u8 { count_p1 += 1; }
        if bp.owner == 2_u8 { count_p2 += 1; }
        i += 1;
    };
    (count_p1, count_p2)
}

/// Проверяет, может ли текущий игрок сделать хотя бы один ход.
/// Перебирает все фигуры текущего игрока и (пока что) оставлено как TODO для получения списка возможных ходов.
pub fn can_player_move(ref world: WorldStorage, gm: GameMatch) -> bool {
    let piece_ids = get_all_piece_ids_for_match(ref world, gm.match_id);
    let span = piece_ids.span();
    let len = span.len();
    let mut i: u32 = 0;
    while i < len {
        let pid = *span.at(i);
        let bp: BoardPiece = world.read_model((gm.match_id, pid));
        if bp.owner == gm.current_turn {
            // TODO: Вызвать функцию, возвращающую список возможных ходов для фигуры.
        }
        i += 1;
    };
    false
}

/// Получает все id фигур в партии.
/// Для этого перебираются все возможные id (от 0 до 23), и если в модели есть фигура (owner != 0),
/// id добавляется в результирующий динамический массив.
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

/// Поиск шашки по заданным координатам (x, y).
/// Перебирает все id шашек для партии и сравнивает координаты.
/// Если найдена шашка с совпадающими координатами (и owner != 0) – возвращается Option::Some, иначе Option::None.
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
            break; // Выходим из цикла, если шашка найдена.
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