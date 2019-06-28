export function join(...args) {
    var paths = args.map((path) => {
        if (!isString(path) || isBlank(path)) {
            return '';
        }
        // TODO: filter invalid string
        path = path.replace(/^\/+/g, ($1) => '')
            .replace(/\/+$/g, ($1) => '');

        if (isBlank(path)) {
            return '';
        }          
        // TODO: 首尾的 '/'应该保留
        return path += '/';
    });

    return paths.reduce((pre, curr) => pre + curr).slice(0, -1);
}
// url增加起始或末尾斜杠"/"
function appendSlash(url, suffix) {
    if (isBlank(url)) {
        return '';
    }
    
    if (suffix && !/\/$/.test(url)) {
        url += '/';
    } else if (!suffix && !/^\//.test(url)) {
        url = '/' + url;
    }

    return url;
}

// url 移除起始或末尾斜杠"/"
function removeSlash(url, suffix) {
    if (isBlank(url)) {
        return '';
    }
    
    if (suffix && /\/$/.test(url)) {
        url = url.slice(0, -1);
    } else if (!suffix && /^\//.test(url)) {
        url = url.slice(1);
    }

    return url;
}

export function appendPrefixSlash(url) {
    return appendSlash(url);
}

export function appendSuffixSlash(url) {
    return appendSlash(url, true);
}

export function removePrefixSlash(url) {
    return removeSlash(url);
}

export function removeSuffixSlash(url) {
    return removeSlash(url, true);
}

export function adjustBaseURL(baseURL) {
    if (baseURL) {
        baseURL = baseURL.trim();
        baseURL = removeSuffixSlash(baseURL);
    // 解决 baseURL 为 0, false, ''的情况
    } else {
        baseURL = null;
    }
    
    return baseURL;
}

export function adjustURL(url) {
    if (url) {
        url = url.trim();
        url = appendPrefixSlash(url);
    }

    return url;
}

export function log(data, title) {
    /* eslint-disable no-console */
    if (title) {
        console.log(title + ' start');
    }

    if (isIE()) {
        console.log(JSON.stringify(data));
    } else {
        console.log(data);
    }

    if (title) {
        console.log(title + ' end');
    }
    /* eslint-enable no-console */
}

// 内部函数, 用于判断对象类型
function _getClass(object) {
    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
}

export function isArray(obj) {
    return _getClass(obj).toLowerCase() === 'array';
}

export function isString(obj) {
    return _getClass(obj).toLowerCase() === 'string';
}

export function isDate(obj) {
    return _getClass(obj).toLowerCase() === 'date';
}

export function isObject(obj) {
    return _getClass(obj).toLowerCase() === 'object';
}

export function isNumber(obj) {
    return _getClass(obj).toLowerCase() === 'number';
}

export function isFunction(obj) {
    return _getClass(obj).toLowerCase() === 'function';
}

export function isFormData(obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData;
}

export function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

export function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
    } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
}
  
export function isIE() {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1) {
        return true;
    }
    return false;
}

/**
 * @desc 判断参数是否为空, 包括null, undefined, [], '', {}
 * @param {object} obj 需判断的对象
 */
export function isEmpty(obj) {
    var empty = false;

    if (obj === null || obj === undefined) { // null and undefined
        empty = true;
    } else if ((isArray(obj) || isString(obj)) && obj.length === 0) {
        empty = true;
    } else if (isObject(obj)) {
        var hasProp = false;
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                hasProp = true;
                break;
            }
        }
        if (!hasProp) {
            empty = true;
        }
    } else if (isNumber(obj) && isNaN(obj)) {
        empty = true;
    }
    return empty;
}

/**
 * @desc 判断参数是否不为空
 */
export function isNotEmpty(obj) {
    return !isEmpty(obj);
}

/**
 * @desc 判断参数是否为空字符串, 比isEmpty()多判断字符串中全是空格的情况, 如: '   '.
 * @param {string} str 需判断的字符串
 */
export function isBlank(str) {
    if (isEmpty(str)) {
        return true;
    } else if (isString(str) && str.trim().length === 0) {
        return true;
    }
    return false;
}

/**
 * @desc 判断参数是否不为空字符串
 */
export function isNotBlank(obj) {
    return !isBlank(obj);
}

/**
 * @desc 函数节流
 * @url http://underscorejs.org/#throttle
 * @param {string} func 防抖函数
 * @param {string} wait 间隔时间
 * @param {string} options 可选项
 */
export function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) {
        options = {};
    }

    var later = function() {
        previous = options.leading === false ? 0 : +new Date();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) {
            context = args = null;
        }
    };

    return function() {
        var now = +new Date();
        if (!previous && options.leading === false) {
            previous = now;
        } 
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}

export function normalizeHeaderName(headers = {}, normalizedName) {
    for (let key in headers) {
        if (key.toUpperCase() === normalizedName.toUpperCase()) {
            if (key !== normalizedName) {
                headers[normalizedName] = headers[key];
                delete headers[key];
            }
            return headers[normalizedName];
        }
    }
}