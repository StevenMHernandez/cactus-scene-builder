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
        slugify: slugify
    }
});