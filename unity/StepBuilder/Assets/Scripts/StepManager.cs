using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class StepManager : MonoBehaviour
{
    public GameObject modelHolderObj;
    
    public List<StepData> steps;
    public int stepIndex;

    void OnEnable()
    {
        EventHandler.TransformableChangedEvent += OnTransformableChanged;
    }

    void OnDisable()
    {
        EventHandler.TransformableChangedEvent -= OnTransformableChanged;
    }

    private void OnTransformableChanged(Transform trans, Vector3 position, Quaternion rotation)
    {
        string transformPath = GetTransformPath(trans);
        var transformations = steps[stepIndex].transformations.FindAll(t => t.transformPath == transformPath);
        foreach (var tr in transformations)
        {
            tr.position = position;
            tr.rotation = rotation;
        }
    }

    private string GetTransformPath(Transform t)
    {
        if (t.parent == null)
            return t.name;

        string path = t.name;
        Transform parent = t.parent;
        while (parent && parent != modelHolderObj.transform)
        {
            path = parent.name + "/" + path;
            parent = parent.parent;
        }

        return path;
    }   

    public void CreateStep()
    {
        StepData newStep = new StepData();
        
        // iterate over all transformable parts
        var transformableObjects = GameObject.FindGameObjectsWithTag("Transformable");
        foreach (var t in transformableObjects)
        {
            Transformation transformation = new Transformation();
            transformation.transformPath = GetTransformPath(t.transform);
            transformation.position = t.transform.position;
            transformation.rotation = t.transform.localRotation;
            newStep.transformations.Add(transformation);
        }

        steps.Add(newStep);

        EventHandler.CallStepCreatedEvent(steps.Count - 1);
    }

    public void TransitionToStep(int newStepIndex)
    {
        StepData newStepData = steps[newStepIndex];

        AnimationClip transitionAnimation = new AnimationClip();

        foreach (Transformation transformation in newStepData.transformations)
        {
            Transform targetTransform = GameObject.Find(transformation.transformPath).transform;

            if (transformation.position != Transformation.ZERO_POSITION)
            {
                transitionAnimation = AnimationUtils.AddTranslationAnimation(transitionAnimation, transformation.transformPath, targetTransform.position, transformation.position);
            }
            if (transformation.rotation != Transformation.ZERO_ROTATION)
            {
                transitionAnimation = AnimationUtils.AddRotationAnimation(transitionAnimation, transformation.transformPath, targetTransform.localRotation, transformation.rotation);
            }
        }

        transitionAnimation.name = "step_" + stepIndex;
        modelHolderObj.GetComponent<Animation>().AddClip(transitionAnimation, transitionAnimation.name);
        modelHolderObj.GetComponent<Animation>().clip = transitionAnimation;
        modelHolderObj.GetComponent<Animation>().Play();

        stepIndex = newStepIndex;
    }
}
