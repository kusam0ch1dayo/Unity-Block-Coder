using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;
using System.Linq;

namespace Game
{
    [RequireComponent(typeof(AudioSource))]
    public class Shooter : MonoBehaviour
    {
        [Header("設定")]
        public float range = 50f;
        public Text scoreText;
        [SerializeField] private AudioSource audioSource;
        public AudioClip shotClip;
        private Animator animator;
        private int score;
        public Button resetButton;

        void Start()
        {
            animator = GetComponent<Animator>();
            score = PlayerPrefs.GetInt("HighScore", 0);
            resetButton.onClick.AddListener(ResetScore);
        }

        // 毎フレーム
        void Update()
        {
            if (Mouse.current.leftButton.wasPressedThisFrame)
            {
                audioSource.PlayOneShot(shotClip);
                animator.SetTrigger("Shoot");
                if (Physics.Raycast(Camera.main.ScreenPointToRay(Mouse.current.position.ReadValue()), out RaycastHit hit, range))
                {
                    if (hit.collider.CompareTag("Enemy"))
                    {
                        Destroy(hit.collider.gameObject);
                        score += 10;
                        scoreText.text = "Score: " + score;
                    }
                }
            }
            Debug.DrawRay(transform.position, transform.forward * range, Color.red);
            if (Physics.Raycast(transform.position, transform.forward, out RaycastHit h2, 5f)) { animator.SetBool("near", true); }
            var top = new int[] { 1, 2 }.Max();
        }

        public void ResetScore()
        {
            score = 0;
            PlayerPrefs.SetInt("HighScore", score);
            PlayerPrefs.Save();
        }
    }
}
