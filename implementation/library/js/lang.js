/**
 * @author Reza Sefidgar
 * Object used for showing different text depending on the language options.
 */

var LNG = (function () {
    var config = {},
        fetches = $.when.apply($, $.map(['en', 'de'], function (index, value) {
            return $.getJSON('lang/' + index + '.json')
        }));

    fetches.done(function () {
        var jsonObj;

        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i][1] === 'success') {
                jsonObj = arguments[i][0];
                config[jsonObj.name] = jsonObj.fields;
            }
        }
    });

    var _LNG = function (opt) {
        if (opt === undefined)
            opt = 'en';

        var language = opt;
        this.getLanguage = function () { return language; };
        this.setLanguage = function (lang) { language = lang; }
    };

    _LNG.prototype = {
        K: function (key) {
            var obj = config[this.getLanguage()],
                result;

            if(obj !== undefined)
                result = obj[key];

            if (result !== undefined)
                return result;
            else
                return '__UNDEFINED__';
        }
    };

    return new _LNG();
})();