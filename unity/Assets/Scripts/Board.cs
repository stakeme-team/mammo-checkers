using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using UnityEngine;

public class Board : MonoBehaviour
{
    public Transform player1Parent;
    public Transform player2Parent;
    public bool isPlayer1Turn;
    private bool isDoubleCapture = false;
    private Vector2Int PieceWithDoubleCapture;

    [DllImport("__Internal")]
    private static extern void MovePiece(int matchId, int fromX, int fromY, int toX, int toY);

    [DllImport("__Internal")]
    private static extern void MoveCornerPiece(int matchId, int[] fromAndToPath, int arraySize);

    private int[,] boardState = new int[8, 8]
    {
        { 0, 0, 0, 0, 0, 2, 2, 2 },
        { 0, 0, 0, 0, 0, 2, 2, 2 },
        { 0, 0, 0, 0, 0, 2, 2, 2 },
        { 0, 0, 0, 0, 0, 0, 0, 0 },
        { 0, 0, 0, 0, 0, 0, 0, 0 },
        { 1, 1, 1, 0, 0, 0, 0, 0 },
        { 1, 1, 1, 0, 0, 0, 0, 0 },
        { 1, 1, 1, 0, 0, 0, 0, 0 }
    };

    public void InitializeBoard(int[,] updateBoardState)
    {
        boardState = updateBoardState;
        foreach (Transform child in player1Parent.Cast<Transform>().Concat(player2Parent.Cast<Transform>()))
        {
            Destroy(child.gameObject);
        }

        var amIplayerWhite = GetComponent<Player>().amIPlayerWhite;
        for (int y = 0; y < 8; y++)
        {
            for (int x = 0; x < 8; x++)
            {
                if (boardState[y, x] != 0)
                {
                    var worldPosition = BoardToWorldPosition(x, y);
                    var piecePrefab = GetPiecePrefab(boardState[y, x]);
                    var piece = Instantiate(piecePrefab, worldPosition, Quaternion.identity).GetComponent<Piece>();
                    piece.isPlayerWhite = GetIsPlayerForPiece(boardState[y, x]);
                    piece.transform.SetParent(piece.isPlayerWhite ? player1Parent : player2Parent);
                    if (!amIplayerWhite)
                    {
                        piece.transform.Rotate(0, 0, 180);
                    }
                }
            }
        }
        UpdatePieceOpacity();
    }

    private GameObject GetPiecePrefab(int pieceType)
    {
        switch (pieceType)
        {
            case 1: return Resources.Load("Player1Piece") as GameObject;
            case 2: return Resources.Load("Player2Piece") as GameObject;
            case 3: return Resources.Load("Player1Queen") as GameObject;
            case 4: return Resources.Load("Player2Queen") as GameObject;
        }

        //Debug.LogError("Missing prefab");
        return null;
    }

    private Vector3 BoardToWorldPosition(int x, int y)
    {
        var worldX = -3.5f + x;
        var worldY = 3.5f - y;
        return new Vector3(worldX, worldY, 0);
    }

    private Vector2Int WorldToBoardPosition(Vector3 worldPos)
    {
        int x = Mathf.RoundToInt(3.5f + worldPos.x);
        int y = Mathf.RoundToInt(Mathf.Abs(worldPos.y - 3.5f));
        return new Vector2Int(x, y);
    }

    public bool TryMovePiece(Vector3 fromWorldPos, Vector3 toWorldPos, Piece piece)
    {
        if (isPlayer1Turn != piece.isPlayerWhite)
            return false;

        Vector2Int from = WorldToBoardPosition(fromWorldPos);
        Vector2Int to = WorldToBoardPosition(toWorldPos);

        if (GetComponent<Player>().GetTypeGame() == Player.TypeGame.Checkers)
        {
            if (IsMoveValid(from, to, piece))
                return false;

            //Debug.Log(from + " -> " + to);
            MovePieceInBoard(from, to);

            CheckForPromotion(to, piece);
            InitializeBoard(boardState);
            if (!isDoubleCapture)
            {
                isPlayer1Turn = !isPlayer1Turn;
// #if UNITY_EDITOR == true
//                 LocalPlayTest();
// #endif
            }

            SendMoveToServer(from, to);
            UpdatePieceOpacity();
            return true;
        }

        if (!IsMoveValid(from, to))
        {
            TextPopup.Instance.ShowText("Invalid move!");
            //Debug.LogError("Bad move");
            return false;
        }

        isPlayer1Turn = !isPlayer1Turn;
// #if UNITY_EDITOR == true
//                 LocalPlayTest();
// #endif
        MovePieceInBoard(from, to);
        UpdatePieceOpacity();
        return true;
    }

    private bool IsMoveValid(Vector2Int from, Vector2Int to)
    {
        if (boardState[from.y, from.x] == 0)
            return false;

        if (boardState[to.y, to.x] != 0)
            return false;

        if (IsSimpleMove(from, to))
            return true;

        List<Vector2Int> path;
        if (CanReachTargetCell(from, to, out path))
        {
            //Debug.Log(string.Join(" -> ", path.Select(p => $"({p.x}, {p.y})")));
            //Debug.Log(path.Count);
            var fromAndToPath = new List<int>();
            for (int i = 0; i < path.Count - 1; i++)
            {
                fromAndToPath.Add(path[i].y);
                fromAndToPath.Add(path[i].x);
                fromAndToPath.Add(path[i + 1].y);
                fromAndToPath.Add(path[i + 1].x);
            }

            //Debug.Log(fromAndToPath.Aggregate("", (current, t) => current + (t + " ")));
            SendMoveCornerToServer(fromAndToPath.ToArray());
            return true;
        }

        return false;
    }

    private bool IsSimpleMove(Vector2Int from, Vector2Int to)
    {
        int dx = to.x - from.x;
        int dy = to.y - from.y;

        if ((Mathf.Abs(dx) == 1 && dy == 0) || (Mathf.Abs(dy) == 1 && dx == 0))
        {
            //Debug.Log(from + " -> " + to);
            int[] fromAndToPath = new int[4];
            fromAndToPath[0] = from.y;
            fromAndToPath[1] = from.x;
            fromAndToPath[2] = to.y;
            fromAndToPath[3] = to.x;
            SendMoveCornerToServer(fromAndToPath);
            return true;
        }

        return false;
    }

    private bool CanReachTargetCell(Vector2Int from, Vector2Int to, out List<Vector2Int> bestPath)
    {
        bestPath = new List<Vector2Int>();

        if (boardState[from.y, from.x] == 0 || boardState[to.y, to.x] != 0)
            return false;

        HashSet<Vector2Int> visited = new HashSet<Vector2Int>();
        List<Vector2Int> currentPath = new List<Vector2Int>();
        List<Vector2Int> maxPath = new List<Vector2Int>();

        FindLongestJumpPath(from, to, visited, currentPath, ref maxPath);

        if (maxPath.Count > 0)
        {
            bestPath = maxPath;
            return true;
        }

        return false;
    }

    private void FindLongestJumpPath(Vector2Int current, Vector2Int target, HashSet<Vector2Int> visited, 
        List<Vector2Int> currentPath, ref List<Vector2Int> maxPath)
    {
        currentPath.Add(current);
        visited.Add(current);

        if (current == target)
        {
            if (currentPath.Count > maxPath.Count)
            {
                maxPath = new List<Vector2Int>(currentPath);
            }
        }

        Vector2Int[] directions = 
        {
            new Vector2Int(2, 0),  // вправо
            new Vector2Int(-2, 0), // влево
            new Vector2Int(0, 2),  // вверх
            new Vector2Int(0, -2)  // вниз
        };

        foreach (Vector2Int dir in directions)
        {
            Vector2Int nextPos = current + dir;

            if (nextPos.x >= 0 && nextPos.x < 8 && nextPos.y >= 0 && nextPos.y < 8 && boardState[nextPos.y, nextPos.x] == 0)
            {
                Vector2Int midPos = current + dir / 2;

                if (boardState[midPos.y, midPos.x] != 0 && !visited.Contains(nextPos))
                {
                    FindLongestJumpPath(nextPos, target, visited, currentPath, ref maxPath);
                }
            }
        }

        currentPath.RemoveAt(currentPath.Count - 1);
        visited.Remove(current);
    }


    private void SendMoveCornerToServer(int[] fromAndToPath)
    {
#if UNITY_WEBGL == true && UNITY_EDITOR == false
        MoveCornerPiece(GetComponent<Player>().matchId, fromAndToPath, fromAndToPath.GetLength(0));
#endif
    }

// ///////////////////////////////////////////// LOGIC FOR CHECKERS

    private void SendMoveToServer(Vector2Int from, Vector2Int to)
    {
#if UNITY_WEBGL == true && UNITY_EDITOR == false
        MovePiece(GetComponent<Player>().matchId, from.y, from.x, to.y, to.x);
#endif
    }

    private void LocalPlayTest()
    {
        GetComponent<Player>().amIPlayerWhite = !GetComponent<Player>().amIPlayerWhite;
    }

    private bool IsMoveValid(Vector2Int from, Vector2Int to, Piece piece)
    {
        if ((to.x + to.y) % 2 == 0 || boardState[to.y, to.x] != 0)
            return true;

        int deltaX = Mathf.Abs(to.x - from.x);
        int deltaY = Mathf.Abs(to.y - from.y);
        if (deltaX != deltaY)
            return true;

        int pieceType = boardState[from.y, from.x];
        bool isQueen = pieceType == 3 || pieceType == 4;

        return isQueen ? IsQueenMoveValid(from, to) : IsRegularMoveValid(from, to, piece);
    }

    private bool IsRegularMoveValid(Vector2Int from, Vector2Int to, Piece piece)
    {
        int deltaX = Mathf.Abs(to.x - from.x);
        int deltaY = Mathf.Abs(to.y - from.y);
        int directionY = piece.isPlayerWhite ? -1 : 1;

        if (deltaX == 1 && deltaY == 1 && to.y - from.y == directionY)
        {
            if (CheckForMandatoryCapture())
            {
                TextPopup.Instance.ShowText("You must capture an opponent's piece!");
                //Debug.LogError("Need to capture");
                return true;
            }

            return false;
        }

        if (deltaX == 2 && deltaY == 2)
        {
            Vector2Int capturedPiecePosition = GetCapturedPiecePosition(from, to);
            if (boardState[capturedPiecePosition.y, capturedPiecePosition.x] != 0 &&
                IsEnemyPiece(boardState[capturedPiecePosition.y, capturedPiecePosition.x], piece.isPlayerWhite))
            {
                if (isDoubleCapture)
                {
                    if (PieceWithDoubleCapture != new Vector2Int(from.x, from.y))
                    {
                        TextPopup.Instance.ShowText("Continue capturing with the same piece!");
                        //Debug.LogError("Need to capture with the same piece");
                        return true;
                    }
                }

                RemovePieceFromBoard(capturedPiecePosition);
                var doubleTypePiece = boardState[from.y, from.x];
                if (CanPieceCapture(new Vector2Int(to.x, to.y), doubleTypePiece))
                {
                    isDoubleCapture = true;
                    PieceWithDoubleCapture = new Vector2Int(to.x, to.y);
                }
                else
                {
                    isDoubleCapture = false;
                }

                return false;
            }
        }


        return true;
    }

    private bool IsQueenMoveValid(Vector2Int from, Vector2Int to)
    {
        int stepX = (to.x > from.x) ? 1 : -1;
        int stepY = (to.y > from.y) ? 1 : -1;

        int x = from.x + stepX;
        int y = from.y + stepY;

        bool hasCapturedPiece = false;
        Vector2Int capturedPosition = Vector2Int.zero;

        while (x != to.x && y != to.y)
        {
            if (boardState[y, x] != 0)
            {
                if (hasCapturedPiece)
                    return true;

                if (IsEnemyPiece(boardState[y, x], GetIsPlayerForPiece(boardState[from.y, from.x])))
                {
                    hasCapturedPiece = true;
                    capturedPosition = new Vector2Int(x, y);
                }
                else
                {
                    return true;
                }
            }

            x += stepX;
            y += stepY;
        }

        if (!hasCapturedPiece && CheckForMandatoryCapture())
        {
            TextPopup.Instance.ShowText("You must capture an opponent's piece!");
            //Debug.LogError("Need to capture");
            return true;
        }

        if (hasCapturedPiece)
        {
            if (isDoubleCapture)
            {
                if (PieceWithDoubleCapture != new Vector2Int(from.x, from.y))
                {
                    TextPopup.Instance.ShowText("Continue capturing with the same piece!");
                    //Debug.LogError("Need to capture with the same piece");
                    return true;
                }
            }

            RemovePieceFromBoard(capturedPosition);
            var doubleTypePiece = boardState[from.y, from.x];
            if (CanPieceCapture(new Vector2Int(to.x, to.y), doubleTypePiece))
            {
                isDoubleCapture = true;
                PieceWithDoubleCapture = new Vector2Int(to.x, to.y);
            }
            else
            {
                isDoubleCapture = false;
            }
        }

        return false;
    }

    private Vector2Int GetCapturedPiecePosition(Vector2Int from, Vector2Int to)
    {
        return new Vector2Int((from.x + to.x) / 2, (from.y + to.y) / 2);
    }

    private bool IsEnemyPiece(int pieceType, bool isPlayerWhite)
    {
        return isPlayerWhite ? pieceType == 2 || pieceType == 4 : pieceType == 1 || pieceType == 3;
    }

    private void MovePieceInBoard(Vector2Int from, Vector2Int to)
    {
        boardState[to.y, to.x] = boardState[from.y, from.x];
        boardState[from.y, from.x] = 0;
    }

    private void RemovePieceFromBoard(Vector2Int position)
    {
        boardState[position.y, position.x] = 0;
    }

    private void CheckForPromotion(Vector2Int position, Piece piece)
    {
        int pieceType = boardState[position.y, position.x];

        if (piece.isPlayerWhite && position.y == 0 && pieceType == 1)
        {
            boardState[position.y, position.x] = 3;
        }

        if (!piece.isPlayerWhite && position.y == 7 && pieceType == 2)
        {
            boardState[position.y, position.x] = 4;
        }
    }

    private bool CheckForMandatoryCapture()
    {
        if (isDoubleCapture)
        {
            return true;
        }

        for (int y = 0; y < 8; y++)
        {
            for (int x = 0; x < 8; x++)
            {
                int pieceType = boardState[y, x];
                if (pieceType != 0 && GetIsPlayerForPiece(pieceType) == isPlayer1Turn)
                {
                    if (CanPieceCapture(new Vector2Int(x, y), pieceType))
                    {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private bool CanPieceCapture(Vector2Int position, int pieceType)
    {
        bool isQueen = pieceType == 3 || pieceType == 4;

        int[] directionsX = { -1, 1, -1, 1 };
        int[] directionsY = { -1, -1, 1, 1 };

        for (int i = 0; i < 4; i++)
        {
            int targetX = position.x + directionsX[i] * 2;
            int targetY = position.y + directionsY[i] * 2;
            int captureX = position.x + directionsX[i];
            int captureY = position.y + directionsY[i];

            if (IsValidPosition(targetX, targetY) && IsValidPosition(captureX, captureY))
            {
                if (boardState[targetY, targetX] == 0 &&
                    IsEnemyPiece(boardState[captureY, captureX], GetIsPlayerForPiece(pieceType)))
                {
                    return true;
                }
            }

            if (isQueen)
            {
                int stepX = directionsX[i];
                int stepY = directionsY[i];
                int currentX = position.x + stepX;
                int currentY = position.y + stepY;

                while (IsValidPosition(currentX, currentY))
                {
                    if (boardState[currentY, currentX] != 0)
                    {
                        if (IsEnemyPiece(boardState[currentY, currentX], GetIsPlayerForPiece(pieceType)))
                        {
                            int nextX = currentX + stepX;
                            int nextY = currentY + stepY;

                            if (IsValidPosition(nextX, nextY) && boardState[nextY, nextX] == 0)
                            {
                                return true;
                            }
                        }

                        break;
                    }

                    currentX += stepX;
                    currentY += stepY;
                }
            }
        }

        return false;
    }

    private bool IsValidPosition(int x, int y)
    {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    private bool GetIsPlayerForPiece(int pieceType)
    {
        return pieceType == 1 || pieceType == 3;
    }
    
    private void UpdatePieceOpacity()
    {
        Color activeColor = Color.white;
        Color inactiveColor = new Color(0.75f, 0.75f, 0.75f, 1f); // Затемненный (серый)

        foreach (Transform piece in player1Parent)
        {
            SetPieceColor(piece, isPlayer1Turn ? activeColor : inactiveColor);
        }

        foreach (Transform piece in player2Parent)
        {
            SetPieceColor(piece, isPlayer1Turn ? inactiveColor : activeColor);
        }
    }

    private void SetPieceColor(Transform piece, Color color)
    {
        var spriteRenderer = piece.GetComponent<SpriteRenderer>();
        if (spriteRenderer != null)
        {
            spriteRenderer.color = color;
        }
    }
}