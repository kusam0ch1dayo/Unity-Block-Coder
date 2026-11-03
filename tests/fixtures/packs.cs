using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.AI;

public class Chaser : MonoBehaviour
{
    public Transform target;
    private NavMeshAgent agent;

    void Start()
    {
        agent = GetComponent<NavMeshAgent>();
        agent.speed = 3.5f;
    }

    void Update()
    {
        agent.SetDestination(target.position);
        if (!agent.pathPending && agent.remainingDistance <= agent.stoppingDistance)
        {
            agent.isStopped = true;
        }
        if (Keyboard.current.spaceKey.wasPressedThisFrame || Gamepad.current.buttonSouth.isPressed)
        {
            agent.isStopped = false;
        }
        Vector2 move = Gamepad.current.leftStick.ReadValue();
        Debug.Log(agent.remainingDistance);
        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            Debug.Log(Mouse.current.position.ReadValue());
        }
    }
}
