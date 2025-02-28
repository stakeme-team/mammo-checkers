using System;
using UnityEngine;

public class Player : MonoBehaviour
{
    public bool amIPlayerWhite;
    public Camera playerCam;
    public int matchId;
    private string gameType;
    public string rpcUrl;

    public enum TypeGame
    {
        Checkers = 1,
        AngleCheckers = 2,
    }

    public TypeGame GetTypeGame()
    {
        return gameType == "ClassicCheckers" ? TypeGame.Checkers : TypeGame.AngleCheckers;
    }
    
     private void Start()
     {
#if UNITY_EDITOR == true
         InitPlayer("1,1,0,ClassicCheckers,http://graphql-mammo-checkers.mammoblocks.io/graphql");
#endif
    }

    public void InitPlayer(string playerData)
    {
        var data = playerData.Split(',');
        int playerInt = int.Parse(data[0]);
        int currentTurn = int.Parse(data[1]);
        matchId = int.Parse(data[2]);
        gameType = data[3];
        rpcUrl = data[4];

        
        var amIPlayer1 = playerInt == 1;
        amIPlayerWhite = amIPlayer1;
        if (!amIPlayerWhite)
        {
            playerCam.transform.Rotate(0, 0, 180);
        }

        GetComponent<WebRequests>().UpdateBoard(this.matchId, rpcUrl);
        var isPlayer1Turn = currentTurn == 1;
        GetComponent<Board>().isPlayer1Turn = isPlayer1Turn;
    }
    public void UpdateBoardFromServer(int currentTurn)
    {
        var isPlayer1Turn = currentTurn == 1;
        GetComponent<Board>().isPlayer1Turn = isPlayer1Turn;
        GetComponent<WebRequests>().UpdateBoard(this.matchId, rpcUrl);
    }
}