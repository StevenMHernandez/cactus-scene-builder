define(function (require) {
    var dataToBin = function (data) {
        var string = "";
        for (var row in data) {
            for (var column in data[row]) {
                string += (data[row][column] == 1) ? "1" : "0";
            }
        }

        var chars = string.match(/.{8}/g);

        return chars.map(function (c) {
            return String.fromCharCode(parseInt(c, 2));
        }).join("");
    };

    return {
        dataToBin: dataToBin
    }
});