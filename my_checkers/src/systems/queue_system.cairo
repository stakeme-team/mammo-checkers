use crate::models::enums::GameType;

#[starknet::interface]
pub trait IQueueSystem<T> {
    fn join_queue(ref self: T, game_type: GameType);
}

#[dojo::contract]
pub mod queue_system {
    use super::IQueueSystem;
    use starknet::{ContractAddress, get_caller_address, contract_address_const};
    use dojo::world::WorldStorage;
    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;

    use crate::models::queue::MatchQueue;
    use crate::models::match_id_counter::MatchIDCounter;
    use crate::models::game_match::{GameMatch, MatchCreated};
    use crate::models::enums::{GameType, GameStatus};
    use crate::systems::init_board::{init_classic_board, init_corner_board};

    #[abi(embed_v0)]
    impl QueueSystemImpl of IQueueSystem<ContractState> {
        fn join_queue(ref self: ContractState, game_type: GameType) {
            let mut world = self.world_default(); 
            let mut classic_queue: MatchQueue = world.read_model(0);  
            let mut corner_queue: MatchQueue = world.read_model(1);   
            let caller: ContractAddress = get_caller_address();
           
           if game_type == GameType::ClassicCheckers {
                assert!(classic_queue.waiting_count == 0 || classic_queue.first_player != caller, "You cannot join your own queue for Classic Checkers");
            } else if game_type == GameType::CornerCheckers {
                assert!(corner_queue.waiting_count == 0 || corner_queue.first_player != caller, "You cannot join your own queue for Corner Checkers");
            }

            if game_type == GameType::ClassicCheckers {
                assert!(corner_queue.waiting_count == 0 || corner_queue.first_player != caller, "You cannot join Corner Checkers queue while already in Classic Checkers queue");
            } else if game_type == GameType::CornerCheckers {
                assert!(classic_queue.waiting_count == 0 || classic_queue.first_player != caller, "You cannot join Classic Checkers queue while already in Corner Checkers queue");
            }
    
            println!("join_queue called: caller = {:?}, game_type = {:?}", caller, game_type);
    
            match game_type {
                GameType::ClassicCheckers => {
                    println!("Checking ClassicCheckers queue...");
                    println!("Classic queue before: {:?}", classic_queue);
    
                    if classic_queue.waiting_count == 0 {
                        println!("Player {:?} is first in classic queue", caller);
                        classic_queue.waiting_count = 1;
                        classic_queue.first_player = caller;
                        classic_queue.game_type = GameType::ClassicCheckers;
                        world.write_model(@classic_queue);
                    } else if classic_queue.waiting_count == 1 {
                        println!("Player {:?} joins and starts a classic match!", caller);
                        classic_queue.waiting_count = 0;
                        create_new_game(ref world, classic_queue.first_player, caller, classic_queue.game_type);
                        classic_queue.first_player = contract_address_const::<0>();
                        world.write_model(@classic_queue);
                    } else {
                        assert(false, 2);
                    }
                },
                GameType::CornerCheckers => {
                    println!("Checking CornerCheckers queue...");
                    println!("Corner queue before: {:?}", corner_queue);
    
                    if corner_queue.waiting_count == 0 {
                        println!("Player {:?} is first in corner queue", caller);
                        corner_queue.waiting_count = 1;
                        corner_queue.first_player = caller;
                        corner_queue.game_type = GameType::CornerCheckers;
                        world.write_model(@corner_queue);
                    } else if corner_queue.waiting_count == 1 {
                        println!("Player {:?} joins and starts a corner match!", caller);
                        corner_queue.waiting_count = 0;
                        create_new_game(ref world, corner_queue.first_player, caller, corner_queue.game_type);
                        corner_queue.first_player = contract_address_const::<0>();
                        world.write_model(@corner_queue);
                    } else {
                        assert(false, 2);
                    }
                }
            }
        }
    }
    
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"my_checkers")
        }
    }

    fn create_new_game(ref world: WorldStorage, p1: ContractAddress, p2: ContractAddress, g_type: GameType) {
        let mut match_counter: MatchIDCounter = world.read_model(0);
        let match_id_u32: u32 = match_counter.next_id;
        match_counter.next_id += 1;
        world.write_model(@match_counter);
    
        println!(
            "Creating new match: match_id = {:?}, p1 = {:?}, p2 = {:?}, game_type = {:?}",
            match_id_u32, p1, p2, g_type
        );
    
        let new_match = GameMatch {
            match_id: match_id_u32,
            player1: p1,
            player2: p2,
            bet_amount: 0,
            game_type: g_type,
            status: GameStatus::InProgress,
            current_turn: 1,
            chain_capture_in_progress: false,
            last_move_timestamp: 0,
            move_count: 0,
            winner: contract_address_const::<0>(), 
            draw_offered_by_p1: false,
            draw_offered_by_p2: false
        };
    
        world.write_model(@new_match);

        world.emit_event(@MatchCreated {match_id: match_id_u32,player1: p1,player2: p2, status: GameStatus::InProgress, game_type: g_type});
    
        if g_type == GameType::ClassicCheckers {
            println!("Calling init_classic_board for match_id {:?}", match_id_u32);
            init_classic_board(ref world, match_id_u32);
        } else if g_type == GameType::CornerCheckers {
            println!("Calling init_corner_board for match_id {:?}", match_id_u32);
            init_corner_board(ref world, match_id_u32);
        }
    }    
}
