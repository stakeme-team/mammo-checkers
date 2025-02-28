using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json.Linq;
using System.Text;
using System.Net;

public class WebRequests : MonoBehaviour
{
    private int[,] boardState = new int[8, 8];

    public void UpdateBoard(int matchId, string rpcUrl)
    {
        string query = "query MyCheckersBoardPieceModels { myCheckersBoardPieceModels(where: { match_id: " + matchId + " }, limit: 100) { edges { node { x y piece_type } } } }";
        string postBody = "{\"query\":\"" + query.Replace("\"", "\\\"") + "\"}";
        
        

        StartCoroutine(SendPostRequest(rpcUrl, postBody));
    }

    IEnumerator SendPostRequest(string postURL, string postBody)
    {
        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

        using (UnityWebRequest webRequest = new UnityWebRequest(postURL, "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(postBody);
            webRequest.uploadHandler = new UploadHandlerRaw(bodyRaw);
            webRequest.downloadHandler = new DownloadHandlerBuffer();

            webRequest.SetRequestHeader("Content-Type", "application/json");
            webRequest.SetRequestHeader("Accept", "application/json");

            webRequest.certificateHandler = new BypassCertificate();

            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.ConnectionError ||
                webRequest.result == UnityWebRequest.Result.ProtocolError)
            {
                Debug.LogError("POST Error : " + webRequest.error + " from " + postURL);
                //Debug.LogError("Response Code: " + webRequest.responseCode);

                // Dictionary<string, string> headers = webRequest.GetResponseHeaders();
                // if (headers != null)
                // {
                //     foreach (var header in headers)
                //     {
                //         Debug.LogError(header.Key + ": " + header.Value);
                //     }
                // }
            }
            else
            {
                string jsonResponse = webRequest.downloadHandler.text;
                //Debug.Log("POST Response: " + jsonResponse);

                ParseResponseAndUpdateBoard(jsonResponse);
            }
        }
    }

    private void ParseResponseAndUpdateBoard(string jsonResponse)
    {
        for (int i = 0; i < 8; i++)
        {
            for (int j = 0; j < 8; j++)
            {
                boardState[i, j] = 0;
            }
        }

        JObject response = JObject.Parse(jsonResponse);
        JArray edges = (JArray)response["data"]["myCheckersBoardPieceModels"]["edges"];

        foreach (var edge in edges)
        {
            int x = edge["node"]["x"].Value<int>();
            int y = edge["node"]["y"].Value<int>();
            int pieceType = edge["node"]["piece_type"].Value<int>();

            boardState[x, y] = pieceType;
        }
        GetComponent<Board>().InitializeBoard(boardState);
    }
}

public class BypassCertificate : CertificateHandler
{
    protected override bool ValidateCertificate(byte[] certificateData)
    {
        return true;
    }
}
