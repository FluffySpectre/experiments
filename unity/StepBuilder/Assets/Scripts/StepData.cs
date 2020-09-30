using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class Transformation
{
    public static readonly Vector3 ZERO_POSITION = new Vector3(-1, -1, -1);
    public static readonly Quaternion ZERO_ROTATION = new Quaternion(-1, -1, -1, -1);
    public static readonly Vector3 ZERO_SCALE = new Vector3(-1, -1, -1);
    
    public string transformPath; // e.g. Model1 or Model1/Cube1
    public Vector3 position = ZERO_POSITION;
    public Quaternion rotation = ZERO_ROTATION;
    public Vector3 scale = ZERO_SCALE;
}

[System.Serializable]
public class StepData
{
    public List<Transformation> transformations = new List<Transformation>();
}
