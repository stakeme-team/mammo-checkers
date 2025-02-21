#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage, ModelStorageTest};
    use dojo::world::WorldStorageTrait;
    use dojo_cairo_test::{spawn_test_world, NamespaceDef, TestResource};
    use crate::models::board_piece::{BoardPiece, m_BoardPiece}; 
    use crate::systems::init_board::{init_classic_board, init_corner_board};

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "my_checkers",
            resources: [
                TestResource::Model(m_BoardPiece::TEST_CLASS_HASH),
            ]
                .span(),
        };
        ndef
    }

    #[test]
    fn test_board_initialization_classic() {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        
        let match_id = 1_u32; 
        init_classic_board(ref world, match_id);
        
        // Проверяем количество фигур
        let all_pieces: Vec<BoardPiece> = world.read_all_models();  
        assert(all_pieces.len() == 24, 'Incorrect number of pieces initialized');

        // Проверяем, что у каждого игрока по 12 фигур
        let player1_pieces: Vec<&BoardPiece> = all_pieces.iter().filter(|p| p.owner == 1).collect();
        let player2_pieces: Vec<&BoardPiece> = all_pieces.iter().filter(|p| p.owner == 2).collect();
        assert(player1_pieces.len() == 12, 'Player 1 has incorrect number of pieces');
        assert(player2_pieces.len() == 12, 'Player 2 has incorrect number of pieces');

        // Проверяем, что координаты корректные
        for piece in player1_pieces {
            assert(piece.x >= 5 && piece.x <= 7, 'Player 1 piece in wrong row');
        }
        for piece in player2_pieces {
            assert(piece.x >= 0 && piece.x <= 2, 'Player 2 piece in wrong row');
        }
    }

    #[test]
    fn test_board_initialization_corner() {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        
        let match_id = 2_u32;
        init_corner_board(world, match_id);
        
        let all_pieces: Vec<BoardPiece> = world.read_all_models();  
        assert(all_pieces.len() == 12, 'Incorrect number of pieces initialized in corner mode');

        let player1_pieces: Vec<&BoardPiece> = all_pieces.iter().filter(|p| p.owner == 1).collect();
        let player2_pieces: Vec<&BoardPiece> = all_pieces.iter().filter(|p| p.owner == 2).collect();
        assert(player1_pieces.len() == 6, 'Player 1 has incorrect number of pieces in corner mode');
        assert(player2_pieces.len() == 6, 'Player 2 has incorrect number of pieces in corner mode');
    }
}
