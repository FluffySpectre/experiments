using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Transformable : MonoBehaviour
{
    private Vector3 initialPosition;
    private Quaternion initialRotation;
    private Vector3 initialScale;
    private Vector3 lastPosition;
    private Quaternion lastRotation;
    private Vector3 lastScale;

    void Awake()
    {
        initialPosition = transform.position;
        initialRotation = transform.localRotation;
        initialScale = transform.localScale;
        lastPosition = initialPosition;
        lastRotation = initialRotation;
        lastScale = initialScale;
    }

    void Update()
    {
        if (transform.position != lastPosition)
        {
            EventHandler.CallTransformableChangedEvent(transform, transform.position, transform.localRotation, transform.localScale);
            lastPosition = transform.position;
        }
        if (transform.localRotation != lastRotation)
        {
            EventHandler.CallTransformableChangedEvent(transform, transform.position, transform.localRotation, transform.localScale);
            lastRotation = transform.localRotation;
        }
        if (transform.localScale != lastScale)
        {
            EventHandler.CallTransformableChangedEvent(transform, transform.position, transform.localRotation, transform.localScale);
            lastScale = transform.localScale;
        }
    }
}
