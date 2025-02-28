using System.Collections;
using UnityEngine;
using TMPro;

public class TextPopup : MonoBehaviour
{
    public static TextPopup Instance { get; private set; }
    public GameObject textObject;
    public TMP_Text tmpText;
    public float fadeDuration = 0.1f;
    public float displayTime = 1f;

    private CanvasGroup canvasGroup;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Start()
    {
        canvasGroup = textObject.GetComponent<CanvasGroup>();
        if (canvasGroup == null)
            canvasGroup = textObject.AddComponent<CanvasGroup>();
        
        textObject.SetActive(false);
    }

    public void ShowText(string message)
    {
        StopAllCoroutines();
        StartCoroutine(FadeTextRoutine(message));
    }
    
    private IEnumerator FadeTextRoutine(string message)
    {
        textObject.SetActive(true);
        tmpText.text = message;
        yield return StartCoroutine(Fade(0, 1, fadeDuration));
        yield return new WaitForSeconds(displayTime);
        yield return StartCoroutine(Fade(1, 0, fadeDuration));
        textObject.SetActive(false);
    }

    private IEnumerator Fade(float start, float end, float duration)
    {
        float elapsed = 0;
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            canvasGroup.alpha = Mathf.Lerp(start, end, elapsed / duration);
            yield return null;
        }
        canvasGroup.alpha = end;
    }
}
