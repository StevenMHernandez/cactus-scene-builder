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

    return {
        clear: clear,
        invert: invert,
        floodFill: floodFill,
    };
});