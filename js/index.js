requirejs.config({
    paths: {
        filesaver: '../bower_components/file-saver/FileSaver',
        jszip: '../bower_components/jszip/dist/jszip'
    }
});

require(['flowchart', 'paint', 'canvas', 'convert', 'config', 'jszip', 'filesaver'], function (flowchart, paint, cv, convert, config, jszip) {

    /////////////////////
    // DOCUMENT LISTENERS

    $(window).on('resize', function () {
        cv.setup();

        printOntoCanvas();
    });

    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: // left
                flowchart.switchOperators(flowchart.getPreviousOperatorId());
                printOntoCanvas();
                break;
            case 39: // right
                flowchart.switchOperators(flowchart.getNextOperatorId());
                printOntoCanvas();
                break;
            default:
                return;
        }
        e.preventDefault();
    });

    ////////////////////
    // TOOLBAR LISTENERS

    $("#save_to_file").on("click", function () {
        var operators = flowchart.getAllOperators();

        var zip = new jszip();

        for (var i = 1; i <= flowchart.getOperatorCount(); i++) {
            var o = operators['operator_' + i];
            zip.file(i + ".txt", convert.dataToBin(o.canvas));
        }

        zip.generateAsync({type: "blob"})
            .then(function (blob) {
                saveAs(blob, "scene.zip");
            });
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

        printOntoCanvas();

        saveCanvas();
    });

    $("#clear_frame").on("click", function () {
        var canvas = currentCanvas();

        canvas = paint.clear(canvas);

        saveToCanvas(canvas);

        printOntoCanvas();
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

            printOntoCanvas();
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

    function printOntoCanvas(operatorId) {
        cv.printOntoCanvas(currentCanvas());
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
