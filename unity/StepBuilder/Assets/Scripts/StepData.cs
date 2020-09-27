using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class Transformation
{
    public static readonly Vector3 ZERO_POSITION = new Vector3(-1, -1, -1);
    public static readonly Quaternion ZERO_ROTATION = new Quaternion(-1, -1, -1, -1);
    
    public string transformPath; // e.g. Model1 or Model1/Cube1
    public Vector3 position = ZERO_POSITION;
    public Quaternion rotation = ZERO_ROTATION;
}

[System.Serializable]
public class StepData
{
    public Transformation[] transformations;
}
