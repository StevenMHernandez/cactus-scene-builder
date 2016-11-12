require(['flowchart', 'paint', 'canvas', 'config'], function (flowchart, paint, cv) {

    /////////////////////
    // DOCUMENT LISTENERS

    $(window).on('resize', function () {
        cv.setup();

        reloadCanvas();
    });

    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: // left
                reloadCanvas(flowchart.getPreviousOperatorId());
                break;
            case 39: // right
                reloadCanvas(flowchart.getNextOperatorId());
                break;
            default:
                return;
        }
        e.preventDefault();
    });

    ////////////////////
    // CONTROL LISTENERS

    $("#new_frame").on("click", function () {
        flowchart.buildNewOperator();
        saveCanvas();
    });

    $("#invert_frame").on("click", function () {
        var canvas = currentCanvas();

        canvas = paint.invert(canvas);

        saveToCanvas(canvas);

        reloadCanvas();

        saveCanvas();
    });

    $("#clear_frame").on("click", function () {
        var canvas = currentCanvas();

        canvas = paint.clear(canvas);

        saveToCanvas(canvas);

        reloadCanvas();
    });

    $("#flood_tool").on("click", function () {
        flood ^= 1;
    });

    /////////////////////
    // OPERATOR LISTENERS

    var onOperatorSelect = function (operator) {
        cv.printOntoCanvas(operator.canvas)
    };

    ///////////////////
    // CANVAS LISTENERS

    $("#canvas").on("mousemove", function (e) {
        if (mouseClicked && !flood) {
            var coords = cv.getXY(e);

            cv.draw(coords.x, coords.y);
        }
    }).on("mousedown", function (e) {
        mouseClicked = true;

        var coords = cv.getXY(e);

        var canvas = currentCanvas();
        if (flood) {
            flowchart.setData('canvas', paint.floodFill(canvas, coords.row, coords.column, !canvas[coords.row][coords.column]));

            reloadCanvas();
        } else {
            var color = canvas && canvas[coords.row][coords.column] ? "black" : "white";

            cv.draw(coords.x, coords.y, color);
        }
    }).on("mouseup", function () {
        mouseClicked = false;

        saveCanvas();
    });

    ///////////////
    // GLOBAL FLAGS

    var mouseClicked = false;
    var flood = false;

    ///////
    // MAIN

    flowchart.init(onOperatorSelect);
    cv.setup();
    saveCanvas();

    /////////////////
    // CANVAS HELPERS

    function reloadCanvas(operatorId) {
        if (!operatorId) {
            operatorId = flowchart.getSelectedOperatorId();
        }

        cv.printOntoCanvas(currentCanvas());

        flowchart.switchOperators(operatorId);
    }

    function saveCanvas() {
        flowchart.setData('canvas', cv.getValue());

        storeAsBackgroundImage();
    }

    function storeAsBackgroundImage() {
        var img = canvas.toDataURL("image/png");

        $("#" + flowchart.getSelectedOperatorId()).css("background-image", 'url(' + img + ')');
    }

    function currentCanvas() {
        return flowchart.getSelectedOperatorData().canvas;
    }

    function saveToCanvas(canvas) {
        var op = flowchart.getSelectedOperatorData();
        op.canvas = canvas;
        flowchart.updateOperator(op);
    }
});
