import { Method } from 'enums/common';
import { join, withHost, isString, isArray, isBlank, isFunction } from 'utils/common';

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
        if (isFunction(proxyPath)) {                // 如果是方法则交给方法处理 
            _baseURL = proxyPath(baseURL, options);
        } else {    // string or boolean
            let prefix = isString(proxyPath) ? proxyPath : '/';

            if (isBlank(baseURL)) {
                _baseURL = prefix;
            } else {
                // baseURL包含 host 部分
                if (withHost(baseURL)) {
                    // 移除 host 部分, 如: http://xxx.xxx.xxx
                    _baseURL = baseURL.replace(/^(http[s]?:)?\/\//, '').replace(/^[\w\.:\-]+/, '');
                } else {
                    _baseURL = baseURL;
                }
                _baseURL = join(prefix, _baseURL);                                
            }
         
            _baseURL = _baseURL.replace(/(^\/*)/, '/').replace(/(\/*$)/, '');

            if (_baseURL === '/') {
                _baseURL = null;
            }
        }
    } else {
        _baseURL = baseURL;
    }

    return _baseURL;
}

// 用于处理用户手动调用的 reject()
// TODO: 关注性能问题
export function handleReject(reject, response, options) {
    return function(error) {
        var { config, request } = response;
        var { isDev, onError } = options;

        if (isDev) {
            console.error(error);
        }
        // 确保 onError 的参数结构和 catch 中的 onError 一致.
        onError && onError({
            config,
            request,
            response
        });
        
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

