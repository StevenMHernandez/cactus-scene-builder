define(function (require) {
    var realDataToBin = function (data) {
        var string = "";
        for (var row in data) {
            for (var column in data[row]) {
                string += (data[row][column] == 1) ? "1" : "0";
            }
        }

        var chars = string.match(/.{8}/g).map(function(c) {
            return parseInt(c, 2);
        });

        return Uint8Array.from(chars);
    };

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

    function pad(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }

    function dec2bin(dec){
        return (dec >>> 0).toString(2);
    }

    var binToData = function (bin) {
        var chars = bin.match(/.{8}/g).map(function(char) {
            return char.split("").map(function(char) {
                return pad(dec2bin(String.charCodeAt(char)), 8);
            }).join("").split("").map(function(b) {
                return b == "1";
            });
        });

        return chars;
    };

    var slugify = function(str) {
        // https://gist.github.com/mathewbyrne/1280286
        return str.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '');
    };

    var messagify = function(message) {
        var final = [];
        message.split("\n").forEach(function(line) {
            final.push(message.match(/.{1,8}/g));
        });
        console.log(final);
        return final.join("\n");
    };

    return {
        dataToBin: dataToBin,
        binToData: binToData,
        slugify: slugify,
        realDataToBin: realDataToBin,
    }
});