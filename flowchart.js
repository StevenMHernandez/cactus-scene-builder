define(function () {
    var $flowchart;

    var operatorI = 1;
    var selectedOperatorId = "operator_" + operatorI;

    var init = function (onSelect) {
        $flowchart = $('#flow_chart');

        var data = {
            operators: {
                operator_1: {
                    top: 20,
                    left: 20,
                    properties: {
                        inputs: {
                            input_1: {label: '(:i)'}
                        },
                        outputs: {
                            output_1: {label: '(:i)'}
                        }
                    }
                }
            }
        };

        $flowchart.flowchart({
            data: data,
            onOperatorSelect: function (operatorId) {
                var operator = $flowchart.flowchart('getOperatorData', operatorId);

                selectedOperatorId = operatorId;

                onSelect(operator);

                return true;
            },
            onOperatorCreate: function (operatorId, operatorData, fullElement) {
                fullElement.operator.attr("id", operatorId);

                return true;
            },
            onLinkSelect: function (linkId) {
                // TODO: potentially remove the link, or wait for double click

                return true;
            }
        });
    };


    var getSelectedOperatorId = function () {
        return selectedOperatorId;
    };

    var getSelectedOperatorIdNumber = function () {
        return selectedOperatorId.split("_")[1];
    };

    var getSelectedOperatorData = function () {
        return getOperatorData(selectedOperatorId);
    };

    var getOperatorData = function (operatorId) {
        return $flowchart.flowchart('getOperatorData', operatorId);
    };

    var updateOperator = function (data) {
        return $flowchart.flowchart('setOperatorData', selectedOperatorId, data);
    };

    var buildNewOperator = function () {
        var prevOperator = getOperatorData("operator_" + operatorI);

        operatorI++;

        var newL = prevOperator.left + 150 + 150 < $flowchart.width() ? prevOperator.left + 150 : 20;
        var newT = newL == 20 ? prevOperator.top + 150 : prevOperator.top;

        var operatorId = 'operator_' + operatorI;
        var operatorData = {
            top: newT,
            left: newL,
            properties: {
                inputs: {
                    input_1: {
                        label: '(:i)'
                    }
                },
                outputs: {
                    output_1: {
                        label: '(:i)'
                    }
                }
            }
        };

        var linkData = {
            fromConnector: "output_1",
            toConnector: "input_1",
            fromOperator: "operator_" + (operatorI - 1),
            toOperator: "operator_" + operatorI
        };

        $flowchart.flowchart('createOperator', operatorId, operatorData);
        $flowchart.flowchart('createLink', operatorId, linkData);

        selectedOperatorId = "operator_" + operatorI;

        return operatorData;
    };

    var getFlowChartData = function () {
        return $flowchart.flowchart('getData');
    };

    var getPreviousOperatorId = function () {
        var current = getSelectedOperatorIdNumber();
        return "operator_" + (current == 1 ? operatorI : --current);
    };

    var getNextOperatorId = function () {
        var current = getSelectedOperatorIdNumber();
        return "operator_" + (current == operatorI ? 1 : ++current);
    };

    var setData = function (key, value) {
        var data = getSelectedOperatorData();
        data[key] = value;
        updateOperator(data);
    };

    var switchOperators = function (id) {
        selectedOperatorId = id;
    };

    return {
        init: init,
        buildNewOperator: buildNewOperator,
        updateOperator: updateOperator,
        getSelectedOperatorData: getSelectedOperatorData,
        getSelectedOperatorId: getSelectedOperatorId,
        getPreviousOperatorId: getPreviousOperatorId,
        getNextOperatorId: getNextOperatorId,
        setData: setData,
        switchOperators: switchOperators,
    };
});