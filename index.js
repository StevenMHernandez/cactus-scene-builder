$(document).ready(function () {
    var data = {
        operators: {
            operator1: {
                top: 20,
                left: 20,
                properties: {
                    inputs: {},
                    outputs: {
                        outs: {
                            label: '(:i)',
                            multiple: true
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
            // TODO: re-open image in editor

            return true;
        },
        onLinkSelect: function (linkId) {
            // TODO: potentially remove the link, or wait for double click

            return true;
        }
    });


    /////////
    // CANVAS

    var canvas = document.getElementById("canvas");

    canvas.width = window.innerWidth - canvas.offsetLeft;
    canvas.height = window.innerHeight - canvas.offsetTop;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var mouseClicked = false;
    //var color = "white";

    $("#canvas").on("mousemove", function (e) {
        if (mouseClicked) {
            draw(e);
        }
    }).on("mousedown", function (e) {
        mouseClicked = true;

        var x = (e.clientX - canvas.offsetLeft) / (window.innerWidth - canvas.offsetLeft) * canvas.width;
        var y = (e.clientY - canvas.offsetTop) / (window.innerHeight - canvas.offsetTop) * canvas.height;

        var color = ctx.getImageData(x, y, 1, 1).data;

        ctx.fillStyle = color[0] < 128 ? "white" : "black";

        draw(e);
    }).on("mouseup", function () {
        mouseClicked = false;

        // TODO: store image data
    });

    var screen_image_height = 32;

    var maxW, maxH, sz;

    var widthToHeightRatio = 1; // normally 2, but we will only see the middle square

    if (canvas.width / widthToHeightRatio > canvas.height) {
        sz = canvas.height / screen_image_height;
    } else {
        sz = canvas.width / (screen_image_height * widthToHeightRatio);
    }

    sz = Math.floor(sz);

    maxH = sz * screen_image_height;
    maxW = maxH * widthToHeightRatio;

    function draw(e) {
        var x = (e.clientX - canvas.offsetLeft) / (window.innerWidth - canvas.offsetLeft) * canvas.width;
        var y = (e.clientY - canvas.offsetTop) / (window.innerHeight - canvas.offsetTop) * canvas.height;

        ctx.fillRect(Math.floor(x / sz) * sz, Math.floor(y / sz) * sz, sz - 2, sz - 2);
    }

    drawGrid();

    function drawGrid() {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;

        for (var i = 0; i < canvas.width && i < maxW + 1; i += sz) {
            ctx.beginPath();
            ctx.moveTo(i - 1, 0);
            ctx.lineTo(i - 1, maxH);
            ctx.stroke();
        }
        for (var i = 0; i < canvas.height && i < maxH + 1; i += sz) {
            ctx.beginPath();
            ctx.moveTo(0, i - 1);
            ctx.lineTo(maxW, i - 1);
            ctx.stroke();
        }
    }
});

