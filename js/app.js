(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* @Author: mac
* @Date:   2015-05-28 01:32:12
* @Last Modified by:   mac
* @Last Modified time: 2015-06-09 02:06:10
*/

var queryString = require('query-string');
apishopsQuerystring = require('../modules/querystring');
var source = require('../modules/sources');

console.log(location.search);
//=> ?foo=bar

var parsed = queryString.parse(location.search);
console.log(parsed);

alert(source.get());

//____
},{"../modules/querystring":2,"../modules/sources":3,"query-string":4}],2:[function(require,module,exports){

var querystring = {};

querystring.parse = function (str) {

    'use strict';

    if (typeof str !== 'string') {
        return {};
    }

    str = str.trim().replace(/^(\?|#|&)/, '');

    if (!str) {
        return {};
    }

    return str.trim().split('&').reduce(function (ret, param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        var key = parts[0];
        var val = parts[1];

        key = decodeURIComponent(key);
        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (!ret.hasOwnProperty(key)) {
            ret[key] = val;
        } else if (Array.isArray(ret[key])) {
            ret[key].push(val);
        } else {
            ret[key] = [ret[key], val];
        }

        return ret;
    }, {});
};


querystring.stringify = function (obj) {

    'use strict';

    return obj ? Object.keys(obj).sort().map(function (key) {
        var val = obj[key];

        if (Array.isArray(val)) {
            return val.sort().map(function (val2) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
            }).join('&');
        }

        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    }).join('&') : '';
};



if ('undefined' !== typeof exports) {
    if ('undefined' !== typeof exports && module.exports) {
        exports = module.exports = querystring;
    }
    exports.querystring = querystring;
} else {
    var apishopsQuerystring = querystring;
}
},{}],3:[function(require,module,exports){
/*
* Apishops UTM tags module
* @Author: apishops.com
* @Date:   2015-05-20 00:46:02
* @Last Modified by:   mac
* @Last Modified time: 2015-09-03 02:34:29
*/


var sources = function(search) {

        'use strict';

        var sources = {},
            templates = {
                'utm' : {
                    'source' : 'utm_source',
                    'site' : 'utm_medium',
                    'campaign' : 'utm_campaign',
                    'content' : 'utm_content',
                    'term' : 'utm_term'
                },
                'openstat' : {
                    'source' : 'openstat_service',
                    'campaign' : 'openstat_campaign',
                    'ad' : 'openstat_ad',
                    'content' : 'openstat_source'
                },
                'yandex' : {
                    'from' : 'from'
                },
                'google' : {
                    'click' : 'gclid'
                },
                'apishops' : {
                    'referrer' : 'referrer',
                    'useragent' : 'useragent',
                    'account' : 'sub_id',
                    'site'  : 'client_id',
                    'source' : 'source_id',
                    'ad'    : 'click_id'
                },
                'addvacation' : {
                    'source' : 'label',
                    'account' : 'subid1',
                    'account2' : 'subid2',
                    'account3' : 'subid3',
                    'account4' : 'subid4',
                    'account5' : 'subid5'
                }
            };


        var handleOpenstat = function(query){
            var matches;

            if (query._openstat) {
                matches = query._openstat.match(/([^;]+);([^;]+);([^;]+);([^;]+)/);
                if (matches) {
                    delete query.openstat;
                    query.openstat_service = matches[1];
                    query.openstat_campaign = matches[2];
                    query.openstat_ad = matches[3];
                    query.openstat_source = matches[4];
                }
            }

            return query;
        };


        this.parse = function(search) {

            var system, name, query;

            search = search || ('undefined' === typeof document ? '' : document.location.search);

            query = apishopsQuerystring.parse(search);
            query = handleOpenstat(query);

            //cycle loop all available variables
            for (system in templates) {
                if (templates.hasOwnProperty(system)) {
                    for (name in templates[system]) {
                        if (templates[system].hasOwnProperty(name)) {
                            if (query[templates[system][name]]) {
                                this.set(name, query[templates[system][name]]);
                            }
                        }
                    }
                }
            }

            //set refferer
            if ('undefined' !== typeof document && document.referrer) {
                this.set('referrer', document.referrer);
            }

            //set useragent
            if ('undefined' !== typeof navigator && navigator.userAgent) {
                this.set('useragent', navigator.userAgent);
            }

        };



        this.set = function (name, value) {
            sources[name] = value;
            apishopsCookies.set('sources_' + name, value);
        };



        this.get = function(name, prefix, type) {

            var name_tmp, system,
                return_obj = {},
                return_val;

            name = name || 'all';
            prefix = prefix || '';
            type = type || 'native';

            if (name === 'all') {

                for (system in templates) {
                    if (templates.hasOwnProperty(system)) {
                        for (name_tmp in templates[system]) {
                            if (templates[system].hasOwnProperty(name_tmp)) {

                                return_val = this.get(name_tmp, prefix, type);

                                if (return_val) {
                                    if (type === 'grouped') {
                                        return_obj[prefix + name_tmp] = return_val;
                                    } else {
                                        return_obj[prefix + templates[system][name_tmp]] = return_val;
                                    }
                                }
                            }
                        }
                    }
                }

                return return_obj;

            } else {
                return sources[name] || apishopsCookies.get('sources_' + name);
            }

        };

        this.parse(search);
    };


var apishopsSources = new sources();

if ('undefined' !== typeof exports) {
    if ('undefined' !== typeof exports && module.exports) {
        exports = module.exports = new sources();
    }
    exports.sources = new sources();
}
},{}],4:[function(require,module,exports){
'use strict';

exports.parse = function (str) {
	if (typeof str !== 'string') {
		return {};
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return {};
	}

	return str.trim().split('&').reduce(function (ret, param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		var key = parts[0];
		var val = parts[1];

		key = decodeURIComponent(key);
		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		if (!ret.hasOwnProperty(key)) {
			ret[key] = val;
		} else if (Array.isArray(ret[key])) {
			ret[key].push(val);
		} else {
			ret[key] = [ret[key], val];
		}

		return ret;
	}, {});
};

exports.stringify = function (obj) {
	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (Array.isArray(val)) {
			return val.sort().map(function (val2) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
			}).join('&');
		}

		return encodeURIComponent(key) + '=' + encodeURIComponent(val);
	}).join('&') : '';
};

},{}]},{},[1])