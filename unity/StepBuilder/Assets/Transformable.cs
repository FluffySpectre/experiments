using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Transformable : MonoBehaviour
{
    public Vector3 initialPosition;
    public Quaternion initialRotation;
    
    void Awake()
    {
        initialPosition = transform.position;
        initialRotation = transform.localRotation;
    }

    void Update()
    {
        if (transform.position != initialPosition)
        {
            EventHandler.CallTransformableChangedEvent(transform, transform.position, transform.localRotation);
        }
        if (transform.localRotation != initialRotation)
        {
            EventHandler.CallTransformableChangedEvent(transform, transform.position, transform.localRotation);
        }
    }
}
