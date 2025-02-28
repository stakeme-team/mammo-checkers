using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Piece : MonoBehaviour
{
    private Rigidbody2D rigidbody2d;
    public bool isPlayerWhite;
    private Board board;
    private SpriteRenderer pieceRenderer;
    private Vector3 startPosition;
    private Vector3 mousePosition;
    private void Start()
    {
        rigidbody2d = GetComponent<Rigidbody2D>();
        board = GameObject.Find("Board").GetComponent<Board>();
        pieceRenderer = GetComponent<SpriteRenderer>();
    }

    private void OnMouseDown()
    {
        if (board.isPlayer1Turn != board.GetComponent<Player>().amIPlayerWhite ||
            board.GetComponent<Player>().amIPlayerWhite != isPlayerWhite)
        {
            return;
        }

        startPosition = transform.position;
        pieceRenderer.sortingOrder = 1;
    }

    private void OnMouseDrag()
    {
        if (board.isPlayer1Turn != board.GetComponent<Player>().amIPlayerWhite ||
            board.GetComponent<Player>().amIPlayerWhite != isPlayerWhite)
        {
            return;
        }

        mousePosition = GetMouseWorldPosition();
        mousePosition.x = Mathf.Clamp(mousePosition.x, -3.5f, 3.5f);
        mousePosition.y = Mathf.Clamp(mousePosition.y, -3.5f, 3.5f);
        rigidbody2d.MovePosition(mousePosition);
    }

    private void OnMouseUp()
    {
        if (board.isPlayer1Turn != board.GetComponent<Player>().amIPlayerWhite ||
            board.GetComponent<Player>().amIPlayerWhite != isPlayerWhite)
        {
            return;
        }
        
        Vector3 endPosition = SnapToGrid(mousePosition);

        MovePosition(board.TryMovePiece(startPosition, endPosition, this) ? endPosition: startPosition);

        pieceRenderer.sortingOrder = 0;
    }

    private Vector3 GetMouseWorldPosition()
    {
        Vector3 mousePosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);
        mousePosition.z = 0;
        return mousePosition;
    }

    private Vector3 SnapToGrid(Vector3 position)
    {
        int x = Mathf.RoundToInt(position.x + 3.5f);
        int y = Mathf.RoundToInt(position.y + 3.5f);

        return new Vector3(x - 3.5f, y - 3.5f, 0);
    }

    private void MovePosition(Vector3 position)
    {
        rigidbody2d.MovePosition(SnapToGrid(position));
        pieceRenderer.sortingOrder = 0;
    }

}