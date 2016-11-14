define(function (require) {
    var config = require("config");

    var clear = function (data) {
        for (var row in data) {
            for (var column in data[row]) {
                data[row][column] = 0;
            }
        }
        return data;
    };

    var invert = function (data) {
        for (var row in data) {
            for (var column in data[row]) {
                data[row][column] ^= 1;
            }
        }
        return data;
    };

    var floodFill = function (data, row, col, newValue) {
        if (row < 0 || row >= config.height
            || col < 0 || col >= config.height) {
            return data;
        }

        if (data[row][col] != newValue) {
            data[row][col] = newValue;

            data = floodFill(data, row, col + 1, newValue);
            data = floodFill(data, row, col - 1, newValue);
            data = floodFill(data, row + 1, col, newValue);
            data = floodFill(data, row - 1, col, newValue);
        }

        return data;
    };

    var shiftLeft = function (data) {
        for (var row in data) {
            for (var column = 0; column < data[row].length; column++) {
                if (column != config.height - 1) {
                    data[row][column] = data[row][column + 1];
                } else {
                    data[row][column] = 0;
                }
            }
        }

        return data;
    };

    var shiftRight = function (data) {
        for (var row in data) {
            for (var column = data[row].length - 1; column >= 0; column--) {
                if (column > 0) {
                    data[row][column] = data[row][column - 1];
                } else {
                    data[row][column] = 0;
                }
            }
        }

        return data;
    };

    var shiftUp = function (data) {
        for (var row = 0; row < data.length; row++) {
            for (var column = 0; column < data[row].length; column++) {
                if (row != config.height - 1) {
                    data[row][column] = data[row + 1][column];
                } else {
                    data[row][column] = 0;
                }
            }
        }

        return data;
    };

    var shiftDown = function (data) {
        for (var row = data.length - 1; row >= 0; row--) {
            for (var column = 0; column < data[row].length; column++) {
                if (row > 0) {
                    data[row][column] = data[row - 1][column];
                } else {
                    data[row][column] = 0;
                }
            }
        }

        return data;
    };

    return {
        clear: clear,
        invert: invert,
        floodFill: floodFill,
        shiftLeft: shiftLeft,
        shiftUp:shiftUp,
        shiftRight: shiftRight,
        shiftDown:shiftDown,
    };
});