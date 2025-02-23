#[starknet::interface]
pub trait IActions<T> {
    fn make_move(ref self: T, match_id: u32, from_x: u8, from_y: u8, to_x: u8, to_y: u8);
    fn corner_make_moves(ref self: T, match_id: u32, steps: Array<(u8, u8, u8, u8)>);
    fn offer_draw(ref self: T, match_id: u32);
}

#[dojo::contract]
pub mod actions {
    use super::IActions;
    use starknet::{get_caller_address, contract_address_const};
    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;
    // Импорт моделей
    use crate::models::enums::{GameType, GameStatus};
    use crate::models::game_match::{GameMatch, DrawOffered};
    use crate::models::board_piece::MoveMade;
    
    use crate::systems::checkers_logic::{
        execute_classic_move,
        execute_corner_multi_moves,
        find_piece_by_coords,
        check_winner_or_draw,
        CornerStep, 
    };

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn make_move(ref self: ContractState, match_id: u32, from_x: u8, from_y: u8, to_x: u8, to_y: u8) {
            let mut world = self.world_default();  // Получаем world
            let mut gm: GameMatch = world.read_model(match_id);
            
            assert!(gm.status == GameStatus::InProgress, "Game must be in progress");

            assert!(gm.game_type == GameType::ClassicCheckers, "Use corner_make_moves for CornerCheckers");
            
            // Проверяем, чей ход
            let caller = get_caller_address();
            let current_player_addr = if gm.current_turn == 1_u8 {
                gm.player1
            } else {
                gm.player2
            };
            
            assert!(caller == current_player_addr, "It's not your turn");

            // Ищем шашку на (from_x, from_y)
            let piece_opt = find_piece_by_coords(ref world, match_id, from_x, from_y);
            assert!(piece_opt.is_some(), "No piece on this square");
            
            let mut piece = piece_opt.unwrap();
            // Проверяем, что шашка принадлежит текущему игроку
            assert!(piece.owner == gm.current_turn, "This piece does not belong to you");

            gm = execute_classic_move(ref world, gm, piece, to_x, to_y);
            // Увеличиваем счётчик ходов
            gm.move_count += 1;
            // Проверяем, не наступил ли конец игры (победа / ничья / лимит ходов)
            println!("check win1 {:?}", gm.status);
            gm = check_winner_or_draw(ref world, gm);
            println!("check win2 {:?}", gm.status);
            // Сохраняем обновленный GameMatch
            world.write_model(@gm);

            world.emit_event(@MoveMade {
                match_id: match_id,
                player: caller,
                from_x: from_x,
                from_y: from_y,
                to_x: to_x,
                to_y: to_y,
            });
        }

          /// Мультиход для уголков: список (from_x, from_y, to_x, to_y).
        fn corner_make_moves(ref self: ContractState, match_id: u32, steps: Array<(u8, u8, u8, u8)>) {
            let mut world = self.world_default();
            let mut gm: GameMatch = world.read_model(match_id);

            // 1) Игра должна идти
            assert!(gm.status == GameStatus::InProgress, "Game must be in progress");

            assert!(gm.game_type == GameType::CornerCheckers, "corner_make_multi_moves: only for CornerCheckers");

            // 2) Проверяем, что вызывающий адрес = текущий игрок
            let caller = get_caller_address();
            let current_player_addr = if gm.current_turn == 1_u8 {
                gm.player1
            } else {
                gm.player2
            };
            assert!(caller == current_player_addr, "It's not your turn");

            let steps_span = steps.span();
            let steps_len = steps_span.len();
            let mut i: u32 = 0;

            let mut corner_steps = ArrayTrait::<CornerStep>::new();

            while i < steps_len {
                let (fx, fy, tx, ty) = *steps_span.at(i);
                i += 1;
                let step = CornerStep {
                    from_x: fx,
                    from_y: fy,
                    to_x: tx,
                    to_y: ty,
                };
                corner_steps.append(step);
            };

            let corner_steps_copy = corner_steps.clone(); 

            // 4) Вызываем нашу функцию, которая сделает все ходы
            gm = execute_corner_multi_moves(ref world, gm, corner_steps);

            // 5) Проверяем, не закончилась ли игра
            gm = check_winner_or_draw(ref world, gm);

            // 6) Сохраняем изменения
            world.write_model(@gm);

            for step in corner_steps_copy {
                world.emit_event(@MoveMade {
                    match_id: match_id,
                    player: caller,
                    from_x: step.from_x,
                    from_y: step.from_y,
                    to_x: step.to_x,
                    to_y: step.to_y,
                });
            }
        }

        fn offer_draw(ref self: ContractState, match_id: u32) {
            let mut world = self.world_default();
            let mut gm: GameMatch = world.read_model(match_id);
            
            // Проверяем, что игра идет
            assert!(gm.status == GameStatus::InProgress, "Game must be in progress");
        
            // Проверяем, что вызывающий адрес один из игроков матча
            let caller = get_caller_address();
            assert!(caller == gm.player1 || caller == gm.player2, "You must be in this match to offer a draw");
            
            // Устанавливаем флаг, что игрок согласен на ничью
            if caller == gm.player1 {
                gm.draw_offered_by_p1 = true;
            } else if caller == gm.player2 {
                gm.draw_offered_by_p2 = true;
            }
        
            if gm.draw_offered_by_p1 && gm.draw_offered_by_p2 {
                gm.status = GameStatus::Draw;
                gm.winner = contract_address_const::<0>(); 
                world.write_model(@gm);
                
                // Отправляем событие о ничьей
                world.emit_event(@DrawOffered {
                    match_id: match_id,
                    player: caller,
                });
            } else {
                world.write_model(@gm);
            }
        }        
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"my_checkers")
        }
    }
}