using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using RuntimeGizmos;

public class TransformGizmoAdapter : MonoBehaviour
{
    public void SetMoveTool()
    {
        GetComponent<TransformGizmo>().transformType = TransformType.Move;
    }

    public void SetRotateTool()
    {
        GetComponent<TransformGizmo>().transformType = TransformType.Rotate;
    }

    public void SetScaleTool()
    {
        GetComponent<TransformGizmo>().transformType = TransformType.Scale;
    }
}
