using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimationUtils
{
    public static AnimationClip AddTranslationAnimation(AnimationClip animationClip, string transformPath, Vector3 startPos, Vector3 targetPos)
    {
        AnimationCurve translateX = AnimationCurve.EaseInOut(0.0f, startPos.x, 1.0f, targetPos.x);
        AnimationCurve translateY = AnimationCurve.EaseInOut(0.0f, startPos.y, 1.0f, targetPos.y);
        AnimationCurve translateZ = AnimationCurve.EaseInOut(0.0f, startPos.z, 1.0f, targetPos.z);
        animationClip.legacy = true;
        animationClip.SetCurve(transformPath, typeof(Transform), "localPosition.x", translateX);
        animationClip.SetCurve(transformPath, typeof(Transform), "localPosition.y", translateY);
        animationClip.SetCurve(transformPath, typeof(Transform), "localPosition.z", translateZ);

        return animationClip;
    }

    public static AnimationClip AddRotationAnimation(AnimationClip animationClip, string transformPath, Quaternion startRot, Quaternion targetRot)
    {
        const float animDuration = 1f;
        AnimationCurve xCurve = AnimationCurve.EaseInOut(0.0f, startRot.x, animDuration, targetRot.x);
        AnimationCurve yCurve = AnimationCurve.EaseInOut(0.0f, startRot.y, animDuration, targetRot.y);
        AnimationCurve zCurve = AnimationCurve.EaseInOut(0.0f, startRot.z, animDuration, targetRot.z);
        AnimationCurve wCurve = AnimationCurve.EaseInOut(0.0f, startRot.w, animDuration, targetRot.w);
        
        animationClip.legacy = true;
        animationClip.SetCurve(transformPath, typeof (Transform), "localRotation.x", xCurve);
        animationClip.SetCurve(transformPath, typeof (Transform), "localRotation.y", yCurve);
        animationClip.SetCurve(transformPath, typeof (Transform), "localRotation.z", zCurve);
        animationClip.SetCurve(transformPath, typeof (Transform), "localRotation.w", wCurve);

        return animationClip;
    }

    // private AnimationClip CreateRotationClip()
    // {
    //     Quaternion rot; //Quaternion we'll be storing the rotation in
    //     float angle = 180; //rotation each keyframe
    //     int time = 2; //time between keyframes
    //     Vector3 axis = Vector3.up; //define the axis of rotation
    //     int keyframes = 2; //how many keys to add
        
    //     //the four curves; one for each quaternion property
    //     AnimationCurve xCurve = new AnimationCurve(), yCurve = new AnimationCurve(), zCurve = new AnimationCurve(), wCurve = new AnimationCurve();
        
    //     for(int k = 0; k < keyframes; k++){
    //         rot = Quaternion.AngleAxis(angle*k, axis); //create our quaternion key for this keyframe
            
    //         //create the keys
    //         xCurve.AddKey(time*k, rot.x);
    //         yCurve.AddKey(time*k, rot.y);
    //         zCurve.AddKey(time*k, rot.z);
    //         wCurve.AddKey(time*k, rot.w);
    //     }
        
    //     //set the curves on the clip 
    //     AnimationClip animationClip = new AnimationClip(); 
    //     animationClip.legacy = true;
    //     animationClip.SetCurve("", typeof (Transform), "localRotation.x", xCurve);
    //     animationClip.SetCurve("", typeof (Transform), "localRotation.y", yCurve);
    //     animationClip.SetCurve("", typeof (Transform), "localRotation.z", zCurve);
    //     animationClip.SetCurve("", typeof (Transform), "localRotation.w", wCurve);

    //     return animationClip;
    // }
}
