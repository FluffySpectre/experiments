const operators = {
    equal: (a, b) => a === b,
    less: (a, b) => a < b,
    lessEqual: (a, b) => a <= b,
    greater: (a, b) => a > b,
    greaterEqual: (a, b) => a >= b,
    contains: (a, b) => a.contains(b),
};

class Rules {
    constructor() {
        this.rules = [];
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    addRules(rules) {
        this.rules.push(...rules);
    }

    check(facts) {
        const events = [];
        for (let rule of this.rules) {
            // check each condition and count the fulfilled ones
            let fulfilledConditions = 0;
            for (let condition of rule.conditions) {
                const operator = operators[condition.operator];
                if (operator(facts[condition.fact], condition.value)) {
                    fulfilledConditions++;
                }
            }

            // check the boolean operator to connect the conditions and add the event 
            // of the fulfilled rule to the array
            if ((rule.booleanOperator === 'and' && fulfilledConditions === rule.conditions.length) ||
                (rule.booleanOperator === 'or' && fulfilledConditions > 0)) {
                events.push({ ...rule.event });
            }
        }
        return events;
    }
}
