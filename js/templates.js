// テンプレート集: よく作るスクリプトを新しいタブで開く (C# を読み込んでブロックにする)
const TEMPLATES = [
  { name: '2D プレイヤー移動', desc: '左右移動とジャンプ (Rigidbody2D + 接地判定)', code: `using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
public class PlayerController2D : MonoBehaviour
{
    [Header("移動")]
    public float moveSpeed = 5f;
    public float jumpPower = 7f;
    [Header("接地判定")]
    public LayerMask groundLayer;
    public float groundCheckDistance = 0.1f;
    private Rigidbody2D rb;
    private bool isGrounded;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void Update()
    {
        // 左右の移動
        float h = Keyboard.current.dKey.ReadValue() - Keyboard.current.aKey.ReadValue();
        rb.velocity = new Vector2(h * moveSpeed, rb.velocity.y);
        // 足元に地面があるか調べる
        RaycastHit2D hit = Physics2D.Raycast(transform.position, Vector2.down, groundCheckDistance + 0.5f, groundLayer);
        isGrounded = hit.collider != null;
        if (Keyboard.current.spaceKey.wasPressedThisFrame && isGrounded)
        {
            rb.AddForce(Vector2.up * jumpPower, ForceMode2D.Impulse);
        }
    }
}
` },
  { name: '3D プレイヤー移動', desc: '前後移動と左右回転 (WASD)', code: `using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController3D : MonoBehaviour
{
    public float moveSpeed = 5f;
    public float turnSpeed = 120f;

    void Update()
    {
        float v = Keyboard.current.wKey.ReadValue() - Keyboard.current.sKey.ReadValue();
        float h = Keyboard.current.dKey.ReadValue() - Keyboard.current.aKey.ReadValue();
        // 前後に移動して、左右に回転する
        transform.Translate(Vector3.forward * v * moveSpeed * Time.deltaTime);
        transform.Rotate(Vector3.up * h * turnSpeed * Time.deltaTime);
    }
}
` },
  { name: 'カメラ追従', desc: 'ターゲットをなめらかに追いかけるカメラ', code: `using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    public Transform target;
    public Vector3 offset = new Vector3(0, 5, -10);
    [Range(0, 1)]
    public float smooth = 0.1f;

    void LateUpdate()
    {
        if (target == null)
        {
            return;
        }
        Vector3 goal = target.position + offset;
        transform.position = Vector3.Lerp(transform.position, goal, smooth);
        transform.LookAt(target);
    }
}
` },
  { name: '敵の生成', desc: '一定間隔でランダムな位置にプレハブを出す', code: `using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    public GameObject enemyPrefab;
    public float interval = 2f;
    public float range = 8f;

    void Start()
    {
        InvokeRepeating("Spawn", 1, interval);
    }

    void Spawn()
    {
        Vector3 pos = transform.position + new Vector3(Random.Range(-range, range), 0, 0);
        Instantiate(enemyPrefab, pos, Quaternion.identity);
    }
}
` },
  { name: '体力 (HP)', desc: 'ダメージ・HP バー (Slider)・倒れたら消える', code: `using UnityEngine;
using UnityEngine.UI;

public class Health : MonoBehaviour
{
    public int maxHp = 100;
    public Slider hpBar;
    private int hp;

    void Start()
    {
        hp = maxHp;
        UpdateBar();
    }

    public void TakeDamage(int damage)
    {
        hp = Mathf.Max(hp - damage, 0);
        UpdateBar();
        if (hp <= 0)
        {
            Die();
        }
    }

    void UpdateBar()
    {
        if (hpBar != null)
        {
            hpBar.value = (float)hp / maxHp;
        }
    }

    void Die()
    {
        Debug.Log($"{name} が倒れた");
        Destroy(gameObject);
    }
}
` },
  { name: 'スコア管理', desc: 'シングルトン・スコア表示・ハイスコア保存', code: `using UnityEngine;
using UnityEngine.UI;

public class ScoreManager : MonoBehaviour
{
    public static ScoreManager Instance;
    public Text scoreText;
    private int score;
    private int highScore;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Start()
    {
        highScore = PlayerPrefs.GetInt("HighScore", 0);
        Refresh();
    }

    public void AddScore(int amount)
    {
        score += amount;
        if (score > highScore)
        {
            highScore = score;
            PlayerPrefs.SetInt("HighScore", highScore);
        }
        Refresh();
    }

    void Refresh()
    {
        scoreText.text = $"Score: {score}  Best: {highScore}";
    }
}
` },
  { name: '弾', desc: 'まっすぐ飛んで、敵に当たったら消える', code: `using UnityEngine;

public class Bullet : MonoBehaviour
{
    public float speed = 15f;
    public float lifeTime = 3f;

    void Start()
    {
        Destroy(gameObject, lifeTime);
    }

    void Update()
    {
        transform.Translate(Vector3.forward * speed * Time.deltaTime);
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Enemy"))
        {
            Destroy(other.gameObject);
            Destroy(gameObject);
        }
    }
}
` },
  { name: '回転するアイテム', desc: '回転しながら上下にふわふわ動き、取ると消える', code: `using UnityEngine;

public class ItemFloat : MonoBehaviour
{
    public float rotateSpeed = 90f;
    public float floatHeight = 0.25f;
    private Vector3 startPos;

    void Start()
    {
        startPos = transform.position;
    }

    void Update()
    {
        transform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime);
        transform.position = startPos + Vector3.up * Mathf.Sin(Time.time * 2) * floatHeight;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Destroy(gameObject);
        }
    }
}
` },
  { name: '制限時間', desc: 'コルーチンでカウントダウンし、0 でシーン移動', code: `using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class GameTimer : MonoBehaviour
{
    public float timeLimit = 60f;
    public Text timerText;

    void Start()
    {
        StartCoroutine(CountDown());
    }

    IEnumerator CountDown()
    {
        float rest = timeLimit;
        while (rest > 0)
        {
            timerText.text = rest.ToString("F0");
            yield return new WaitForSeconds(1);
            rest -= 1;
        }
        SceneManager.LoadScene("GameOver");
    }
}
` },
  { name: 'タイトル画面', desc: 'スタート / 終了ボタン', code: `using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class TitleMenu : MonoBehaviour
{
    public Button startButton;
    public Button quitButton;

    void Start()
    {
        startButton.onClick.AddListener(StartGame);
        quitButton.onClick.AddListener(QuitGame);
    }

    void StartGame()
    {
        SceneManager.LoadScene("Game");
    }

    void QuitGame()
    {
        Application.Quit();
    }
}
` },
];
const tplDlg = document.getElementById('tplDlg');
document.getElementById('tplList').innerHTML = TEMPLATES.map((t, i) => `<button class="tpl" data-i="${i}"><b>${esc(tr(t.name))}</b><small>${esc(tr(t.desc))}</small></button>`).join('');
document.getElementById('templates').onclick = () => tplDlg.showModal();
document.getElementById('tplClose').onclick = () => tplDlg.close();
document.getElementById('tplList').onclick = async e => {
  const btn = e.target.closest('.tpl');
  if (!btn) return;
  const t = TEMPLATES[+btn.dataset.i];
  if (!tsParser) { document.getElementById('tplMsg').textContent = tr('C# パーサーを読み込み中です…'); await tsReady; }
  document.getElementById('tplMsg').textContent = '';
  newTab({});
  importCs(tr(t.code), false);
  if (typeof adaptUnityVersion === 'function') adaptUnityVersion(true);
  ws.clearUndo();
  tplDlg.close();
  showToast(tr('テンプレート「{0}」を新しいタブで開きました', tr(t.name)));
};
