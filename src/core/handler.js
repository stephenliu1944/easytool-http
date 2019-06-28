import { proxyBaseURL } from 'helpers/proxy';
import { Method } from 'enums/common';
import { appendPrefixSlash, isString, isArray, isNotBlank, isFunction } from 'helpers/util';

function hasEntityBody(method = '') {
    return [Method.POST, Method.PUT, Method.PATCH].includes(method.toLowerCase());
}

export function handleBeforeRequest(options) {
    var promise;
    var beforeRequest = options.beforeRequest;
    // 请求前预处理
    if (beforeRequest) {
        promise = new Promise(function(resolve, reject) {
            beforeRequest(resolve, reject, options);
        });
    } else {
        promise = Promise.resolve(options);
    }
    return promise;
}

export function handleHeaders(options, isXHR) {
    var { headers, method, contentType } = options;
    var _headers = Object.assign({}, headers);
    
    if (isXHR) {
        _headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    if (hasEntityBody(method) && contentType) {
        _headers['Content-Type'] = contentType;
    }
    
    if (!_headers['Content-Type']) {
        delete _headers['Content-Type'];
    }

    return _headers;
}

export function handleCache(options) {
    var { params, cache } = options;
    var _params = Object.assign({}, params);

    // 增加缓存
    if (!cache) {
        _params.t = new Date().getTime();
    }

    return _params;
}

export function handleProxyPath(options) {
    if (!options) {
        return '';
    }

    var { baseURL, proxyPath } = options;
    var _baseURL;
    
    // 为 url 增加代理服务拦截的path
    if (proxyPath) {
        if (proxyPath === true) {                   // 开启后, 默认代理 BaseURl
            _baseURL = proxyBaseURL(baseURL);
        } else if (isString(proxyPath)) {           // 如果是字符串则加在请求的 URL 最前面, 并移除原有请求的 Host 部分.
            _baseURL = proxyPath.replace(/(\/)$/, '');
            // 根路径加上 "/" 请求当前dev服务
            _baseURL = appendPrefixSlash(_baseURL);
            if (isNotBlank(baseURL)) {
                // 根路径后加上非 Host 部分路径, 如: /api
                _baseURL = _baseURL + baseURL.replace(/^(http[s]?:)?\/\//, '')
                    .replace(/^[\w\.:]+/, '');
            }
        } else if (isFunction(proxyPath)) {        // 如果是方法则交给方法处理 
            _baseURL = proxyPath(options);
        }
    } else {
        _baseURL = baseURL;
    }

    return _baseURL;
}

// 用于处理用户手动调用的 reject(), 关注性能问题
export function handleReject(reject, options) {
    var { isDev, onError } = options;

    return function(error) {
        if (isDev) {
            console.error(error);
        }

        onError && onError(error);
        
        reject(error);
    };
}

export function handleTransformData(transform, transformDefault, wrapper, opts) {
    var transformList = [];

    if (isFunction(transform)) {
        transformList.push(transform);
    } else if (isArray(transform)) {
        transformList.push(...transform);
    }

    if (transformDefault) {
        transformList.push(transformDefault);
    }

    if (wrapper) {
        transformList = transformList.map((fn) => wrapper(fn, opts));
    }
    
    return transformList;
}

export function handleInterceptor(interceptor) {
    let use = {};

    if (isFunction(interceptor)) {
        use.success = interceptor;
    } else if (isArray(interceptor)) {
        use.success = interceptor[0];
        use.error = interceptor[1];
    }

    return use;
}

