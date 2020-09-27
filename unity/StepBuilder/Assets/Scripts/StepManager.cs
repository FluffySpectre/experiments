using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class StepManager : MonoBehaviour
{
    public GameObject modelHolderObj;
    
    public StepData[] steps;
    public int stepIndex;
    
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
