using System;
using UnityEngine;

public static class EventHandler
{
    public static event Action<int> StepCreatedEvent;

    public static void CallStepCreatedEvent(int index)
    {
        if (StepCreatedEvent != null)
        {
            StepCreatedEvent(index);
        }
    }

    public static event Action<Transform, Vector3, Quaternion, Vector3> TransformableChangedEvent;

    public static void CallTransformableChangedEvent(Transform trans, Vector3 position, Quaternion rotation, Vector3 scale)
    {
        if (TransformableChangedEvent != null)
        {
            TransformableChangedEvent(trans, position, rotation, scale);
        }
    }
}