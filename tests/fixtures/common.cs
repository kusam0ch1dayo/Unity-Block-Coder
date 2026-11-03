using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.InputSystem;
using UnityEngine.UI;

[RequireComponent(typeof(Rigidbody2D))]
public class Player : MonoBehaviour
{
    // 移動の設定
    [Header("移動")]
    [Range(0, 20)]
    public float speed = 5f;
    [SerializeField] private float jumpPower = 8f;
    [Tooltip("地面のレイヤー")]
    public LayerMask groundLayer;
    public GameObject bulletPrefab;
    public AudioClip jumpClip;
    public Button startButton;
    public Animator animator;
    private Rigidbody2D rb;
    private int[] scores = new int[] { 1, 2, 3 };
    private string playerName;

    void Awake()
    {
        DontDestroyOnLoad(gameObject);
        rb = GetComponent<Rigidbody2D>();
    }

    void Start()
    {
        Cursor.lockState = CursorLockMode.Locked;
        startButton.onClick.AddListener(() =>
        {
            Debug.Log("start");
        });
        InvokeRepeating("Tick", 1, 0.5f);
        StartCoroutine(Countdown(3));
        Debug.Log($"Scene: {SceneManager.GetActiveScene().name}");
        int level = SceneManager.GetActiveScene().buildIndex;
        string label = (Time.time * 2).ToString("F2");
        if (string.IsNullOrEmpty(playerName))
        {
            playerName = "Player";
        }
        int parsed = int.Parse("42");
        float angle = Mathf.Atan2(1, 2) * Mathf.Rad2Deg;
        float t = Mathf.InverseLerp(0, 10, 5);
    }

    void Update()
    {
        float h = Keyboard.current.dKey.ReadValue() - Keyboard.current.aKey.ReadValue();
        rb.velocity = new Vector2(h * speed, rb.velocity.y);
        if (Keyboard.current.spaceKey.wasPressedThisFrame)
        {
            RaycastHit2D hit = Physics2D.Raycast(transform.position, Vector2.down, 1.1f, groundLayer);
            if (hit.collider != null)
            {
                rb.AddForce(Vector2.up * jumpPower, ForceMode2D.Impulse);
                AudioSource.PlayClipAtPoint(jumpClip, transform.position);
                animator.Play("Jump");
            }
        }
        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            GameObject bullet = Instantiate(bulletPrefab, transform.position, Quaternion.AngleAxis(90, Vector3.forward));
            Destroy(bullet, 2);
        }
        Collider2D near = Physics2D.OverlapCircle(transform.position, 0.5f, LayerMask.GetMask("Enemy", "Trap"));
        if (near is BoxCollider2D)
        {
            var box = near as BoxCollider2D;
        }
        GameObject target = GameObject.Find("Target") ?? gameObject;
        transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(Vector3.forward), Time.deltaTime);
        for (int i = 10; i >= 0; i--)
        {
            if (i % 2 == 0)
            {
                continue;
            }
        }
        int n = 0;
        do
        {
            n++;
        } while (n < 3);
        try
        {
            scores[5] = 1;
        }
        catch (System.Exception e)
        {
            Debug.LogError(e.Message);
        }
        if (TryGetComponent(out SpriteRenderer sr))
        {
            sr.color = new Color(1, 0.5f, 0, 1);
        }
        Vector2 dir = (Vector2)transform.right;
    }

    private void Tick()
    {
        Debug.DrawLine(transform.position, Vector3.zero, Color.green);
    }

    IEnumerator Countdown(int count)
    {
        while (count > 0)
        {
            yield return new WaitForSecondsRealtime(1);
            count--;
        }
        yield return new WaitUntil(() => Keyboard.current.anyKey.wasPressedThisFrame);
        yield return new WaitForEndOfFrame();
        StopAllCoroutines();
        yield break;
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Coin"))
        {
            Destroy(other.gameObject);
        }
    }

    void OnDrawGizmos()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, 0.5f);
        Gizmos.DrawWireCube(transform.position, Vector3.one);
        Gizmos.DrawLine(transform.position, transform.position + Vector3.down);
    }
}
