define(function (require) {
    var config = require("config");

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var maxW, maxH, sz;

    var setup = function () {
        setCanvasSize();

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGrid();
    };

    function setCanvasSize() {
        editBox = document.getElementById("edit");
        $editBox = $("#edit");

        canvas.width = window.innerWidth - canvas.offsetLeft;
        canvas.height = window.innerHeight - canvas.offsetTop;

        var widthToHeightRatio = 1; // normally 2, but we will only see the middle square

        if ($editBox.width() / widthToHeightRatio > $editBox.height()) {
            sz = $editBox.height() / config.height;
        } else {
            sz = $editBox.width() / (config.height * widthToHeightRatio);
        }
        sz = Math.floor(sz);

        maxH = sz * config.height;
        maxW = maxH * widthToHeightRatio;

        canvas.width = maxW;
        canvas.height = maxH;

        canvas.style.marginLeft = (($editBox.width() - canvas.width) / 2) + "px";
        canvas.style.marginTop = (($editBox.height() - canvas.height) / 2) + "px";
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
        for (i = 0; i < canvas.height && i < maxH; i += sz) {
            ctx.beginPath();
            ctx.moveTo(0, i - 1);
            ctx.lineTo(maxW, i - 1);
            ctx.stroke();
        }
    }

    var printOntoCanvas = function (data) {
        for (var row in data) {
            for (var column in data[row]) {
                ctx.fillStyle = data[row][column] ? "white" : "black";

                ctx.fillRect(column * sz, row * sz, sz - 2, sz - 2);
            }
        }
    };

    var getValue = function () {
        var val = [];
        for (var y = 0; y < canvas.height && y < maxH + 1; y += sz) {
            var row = [];
            for (var x = 0; x < canvas.width && x < maxW + 1; x += sz) {
                row.push(ctx.getImageData(x, y, 1, 1).data[0] > 128);
            }
            val.push(row);
        }

        return val;
    };

    var draw = function (x, y, color) {
        if (color) {
            ctx.fillStyle = color;
        }
        ctx.fillRect(Math.floor(x / sz) * sz, Math.floor(y / sz) * sz, sz - 2, sz - 2);
    };


    var getXY = function (e) {
        var obj = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };

        obj.row = Math.floor(obj.y / sz);
        obj.column = Math.floor(obj.x / sz);

        return obj;
    };

    return {
        setup: setup,
        printOntoCanvas: printOntoCanvas,
        getValue: getValue,
        draw: draw,
        getXY: getXY,
    };
});