$(document).ready(function () {
    $(window).on('resize', function () {
        setupCanvas();

        reloadCanvas(selectedOperator);
    });

    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: // left
                var current = getSelectedOperatorId();

                current = current == 1 ? operatorI : --current;

                reloadCanvas("operator_" + current);
                break;
            case 39: // right
                var current = getSelectedOperatorId();

                current = current == operatorI ? 1 : ++current;

                reloadCanvas("operator_" + current);
                break;

            default:
                return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    function reloadCanvas(operatorId) {
        var operator = getOperatorData(operatorId);

        if (operator.canvas) {
            loadCanvasData(operator.canvas)
        } else {
            setupCanvas();
        }

        selectedOperator = operatorId;
    }

    var data = {
        operators: {
            operator_1: {
                top: 20,
                left: 20,
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
            }
        }
    };

    var $flowchart = $('#flow_chart');

    $flowchart.flowchart({
        data: data,
        onOperatorSelect: function (operatorId) {
            var operator = $flowchart.flowchart('getOperatorData', operatorId);

            if (operator.canvas) {
                loadCanvasData(operator.canvas)
            } else {
                setupCanvas();
            }

            selectedOperator = operatorId;

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

    /////////
    // FLOWCHART HELPERS

    var operatorI = 1;
    var selectedOperator = "operator_" + operatorI;

    function getSelectedOperatorId() {
        return selectedOperator.split("_")[1];
    }

    function getOperatorData(operatorId) {
        return $flowchart.flowchart('getOperatorData', operatorId);
    }

    function setOperatorData(operatorId, data) {
        return $flowchart.flowchart('setOperatorData', operatorId, data);
    }

    function buildNewOperator() {
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

        selectedOperator = "operator_" + operatorI;

        return operatorData;
    }

    function getFlowChartData() {
        return $flowchart.flowchart('getData');
    }

    /////////
    // CONTROLS

    $("#new_frame").on("click", function () {
        buildNewOperator();
        saveCanvas();
    });

    $("#invert_frame").on("click", function () {
        var operator = getOperatorData(selectedOperator);

        for (row in operator.canvas) {
            for (column in operator.canvas[row]) {
                operator.canvas[row][column] ^= 1;
            }
        }

        setOperatorData(selectedOperator, operator);

        reloadCanvas(selectedOperator);
    });

    $("#clear_frame").on("click", function () {
        var operator = getOperatorData(selectedOperator);

        for (row in operator.canvas) {
            for (column in operator.canvas[row]) {
                operator.canvas[row][column] = 0;
            }
        }

        setOperatorData(selectedOperator, operator);

        reloadCanvas(selectedOperator);
    });


    /////////
    // CANVAS

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var mouseClicked = false;

    var maxW, maxH, sz;

    var screen_image_height = 64;

    setupCanvas();

    function setupCanvas() {
        setCanvasSize();

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        loadGrid();
    }

    function setCanvasSize() {
        editBox = document.getElementById("edit");
        $editBox = $("#edit");

        canvas.width = window.innerWidth - canvas.offsetLeft;
        canvas.height = window.innerHeight - canvas.offsetTop;

        var widthToHeightRatio = 1; // normally 2, but we will only see the middle square

        if ($editBox.width() / widthToHeightRatio > $editBox.height()) {
            sz = $editBox.height() / screen_image_height;
        } else {
            sz = $editBox.width() / (screen_image_height * widthToHeightRatio);
        }
        sz = Math.floor(sz);

        maxH = sz * screen_image_height;
        maxW = maxH * widthToHeightRatio;

        canvas.width = maxW;
        canvas.height = maxH;

        canvas.style.marginLeft = (($editBox.width() - canvas.width) / 2) + "px";
        canvas.style.marginTop = (($editBox.height() - canvas.height) / 2) + "px";
    }

    function draw(e) {
        var coords = getXY(e);

        ctx.fillRect(Math.floor(coords.x / sz) * sz, Math.floor(coords.y / sz) * sz, sz - 2, sz - 2);
    }

    function drawGrid() {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;

        for (var i = 0; i < canvas.width && i < maxW; i += sz) {
            ctx.beginPath();
            ctx.moveTo(i - 1, 0);
            ctx.lineTo(i - 1, maxH);
            ctx.stroke();
        }
        for (var i = 0; i < canvas.height && i < maxH; i += sz) {
            ctx.beginPath();
            ctx.moveTo(0, i - 1);
            ctx.lineTo(maxW, i - 1);
            ctx.stroke();
        }
    }

    function loadGrid() {
        drawGrid();
    }

    function getXY(e) {
        return {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        }
    }

    $("#canvas").on("mousemove", function (e) {
        if (mouseClicked) {
            draw(e);
        }
    }).on("mousedown", function (e) {
        mouseClicked = true;

        var coords = getXY(e);

        var color = ctx.getImageData(coords.x, coords.y, 1, 1).data;

        ctx.fillStyle = color[0] < 128 ? "white" : "black";

        draw(e);
    }).on("mouseup", function () {
        mouseClicked = false;

        saveCanvas();
    });

    function saveCanvas() {
        data = getOperatorData(selectedOperator);
        data.canvas = getCanvasValue();
        setOperatorData(selectedOperator, data);

        storeAsBackgroundImage();
    }

    function storeAsBackgroundImage() {
        var img = canvas.toDataURL("image/png");

        console.log($("#" + selectedOperator));

        $("#" + selectedOperator).css("background-image", 'url(' + img + ')');

        console.log(img);
    }

    function loadCanvasData(data) {
        var string = "";
        for (row in data) {
            for (column in data[row]) {
                ctx.fillStyle = data[row][column] ? "white" : "black";

                ctx.fillRect(column * sz, row * sz, sz - 2, sz - 2);
            }
            string += "\n";
        }
    }

    function getCanvasValue() {
        var val = [];
        for (var y = 0; y < canvas.height && y < maxH + 1; y += sz) {
            var row = [];
            for (var x = 0; x < canvas.width && x < maxW + 1; x += sz) {
                row.push(ctx.getImageData(x, y, 1, 1).data[0] > 128);
            }
            val.push(row);
        }

        return val;
    }

    function logCanvasData(data) {
        var string = "";
        for (row in data) {
            for (column in data[row]) {
                string += (data[row][column] == 1) ? "1" : "0";
            }
            string += "\n";
        }
        console.log(string);
    }
});

