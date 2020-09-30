using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UIStepSelection : MonoBehaviour
{
    public GameObject stepButtonPrefab;
    public StepManager stepManager;

    private int selectedStep = -1;

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
            HighlightButton(index);

            stepManager.TransitionToStep(index);
        });
        HighlightButton(index);

        stepManager.TransitionToStep(index);
    }

    void HighlightButton(int index)
    {
        if (selectedStep > -1)
        {
            var oldButton = transform.GetChild(selectedStep);
            oldButton.Find("Highlight").GetComponent<Image>().enabled = false;
        }

        var newButton = transform.GetChild(index);
        newButton.Find("Highlight").GetComponent<Image>().enabled = true;

        selectedStep = index;
    }
}
