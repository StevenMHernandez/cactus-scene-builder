requirejs.config({
    paths: {
        filesaver: '../bower_components/file-saver/FileSaver',
        jszip: '../bower_components/jszip/dist/jszip',
        modalbox: '../bower_components/modalBox/modalBox',
    }
});

// DEBUG:
delete require.cache;

require(['flowchart', 'paint', 'canvas', 'convert', 'jszip', 'config', 'filesaver', 'modalbox'], function (flowchart, paint, cv, convert, jszip) {

    /////////////////////
    // DOCUMENT LISTENERS

    $(window).on('resize', function () {
        cv.setup();

        printOntoCanvas();
    });

    $(document).keydown(function (e) {
        if (!ignoreKeyDownEvents) {
            if (e.metaKey || e.ctrlKey) {
                switch (e.which) {
                    case 37: // left
                        saveToCanvas(paint.shiftLeft(currentCanvas()));
                        printOntoCanvas();
                        saveCanvas();
                        break;
                    case 38: // up
                        saveToCanvas(paint.shiftUp(currentCanvas()));
                        printOntoCanvas();
                        saveCanvas();
                        break;
                    case 39: // right
                        saveToCanvas(paint.shiftRight(currentCanvas()));
                        printOntoCanvas();
                        saveCanvas();
                        break;
                    case 40: // down
                        saveToCanvas(paint.shiftDown(currentCanvas()));
                        printOntoCanvas();
                        saveCanvas();
                        break;
                    default:
                        return;
                }
            } else {
                switch (e.which) {
                    case 37: // left
                        flowchart.switchOperators(flowchart.getPreviousOperatorId());
                        console.log(flowchart.getSelectedOperatorId());
                        printOntoCanvas();
                        break;
                    case 39: // right
                        flowchart.switchOperators(flowchart.getNextOperatorId());
                        console.log(flowchart.getSelectedOperatorId());
                        printOntoCanvas();
                        break;
                    default:
                        return;
                }
            }
            e.preventDefault();
        }
    });

    $('body').on({
        'dragover dragenter': function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        'drop': function (e) {
            var dataTransfer = e.originalEvent.dataTransfer;
            if (dataTransfer && dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
                $.each(dataTransfer.files, function (i, file) {
                    var reader = new FileReader();
                    reader.readAsBinaryString(file);
                    reader.onloadend = function () {
                        var new_zip = new jszip();
                        new_zip.loadAsync(reader.result)
                            .then(function (zip) {
                                parseZip(zip);
                            });
                    };
                });
            }
        }
    });

    // TODO: move to an appropriate location
    function parseZip(zip) {
        var files = Object.keys(zip.files).map(function (key) {
            return zip.files[key]
        });
        var images = files.filter(function (item) {
            if (item.dir || item.name.startsWith('_')) {
                return false;
            }

            var name = item.name.split('/')[1].split('.')[0];

            if (isNaN(name) || name == "") {
                return false;
            }

            item.frame_id = name;

            return true;
        });

        images = images.sort(function (a, b) {
            return a.frame_id - b.frame_id;
        });

        console.log(images);

        loadNextImage(images, 0);
    }

    // TODO: move to an appropriate location
    function loadNextImage(images, i) {
        images[i].async("text").then(function (u8) {
            saveToCanvas(convert.binToData(u8));
            printOntoCanvas();

            // save
            saveCanvas();

            if (++i != images.length) {
                flowchart.buildNewOperator();

                loadNextImage(images, i);
            }
        });
    }

    ////////////////////
    // TOOLBAR LISTENERS

    $("#open_details_modal").on("click", function () {
        ignoreKeyDownEvents = true;

        $('.modalBox').modalBox({
            keyClose: true,
            bodyClose: true
        });

        var $textarea = $('.modalBox textarea');
        var width = $textarea.outerWidth();
        $textarea.css('maxWidth', width);
        $textarea.css('minWidth', width);
    });

    $('.modalBox .background').on('click', function () {
        $('.modalBox').modalBox('close');
        ignoreKeyDownEvents = false;
    });

    $("#save_to_file").on("click", function () {
        var operators = flowchart.getAllOperators();

        var zip = new jszip();

        for (var i = 1; i <= flowchart.getOperatorCount(); i++) {
            var o = operators['operator_' + i];
            zip.file(i + ".bin", convert.realDataToBin(o.canvas));
        }

        zip.file("message.txt", $("#message").val());
        zip.file("config.txt", JSON.stringify({
            delay: $("#delay").val(),
        }));

        var title = $("#title").val() ? convert.slugify($("#title").val()) : "scene";

        zip.generateAsync({type: "blob"})
            .then(function (blob) {
                saveAs(blob, title + ".zip");
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

    $("#flood_tool").on("click", function (e) {
        flood ^= 1;
        e.currentTarget.textContent = flood ? "Draw Tool" : "Flood Fill";
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
    }).on("mouseout", function () {
        if (mouseClicked) {
            mouseClicked = false;

            saveCanvas();
        }
    });

    ///////////////
    // GLOBAL FLAGS

    var ignoreKeyDownEvents = false;
    var mouseClicked = false;
    var flood = false;

    ///////
    // MAIN

    flowchart.init(onOperatorSelect);
    cv.setup();
    saveCanvas();

    /////////////////
    // CANVAS HELPERS

    function printOntoCanvas() {
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
