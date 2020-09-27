using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UIStepSelection : MonoBehaviour
{
    public GameObject stepButtonPrefab;
    public StepManager stepManager;

    void OnEnable()
    {
        EventHandler.StepCreatedEvent += OnStepCreated;
    }

    void OnDisable()
    {
        EventHandler.StepCreatedEvent -= OnStepCreated;
    }

    void OnStepCreated(int index)
    {
        var buttonObj = Instantiate(stepButtonPrefab, Vector3.zero, Quaternion.identity, transform);
        buttonObj.transform.SetSiblingIndex(transform.childCount - 2);
        var button = buttonObj.GetComponent<Button>();
        button.GetComponentInChildren<Text>().text = "Step " + (index + 1);
        button.onClick.AddListener(() => {
            stepManager.TransitionToStep(index);
        });
    }
}
