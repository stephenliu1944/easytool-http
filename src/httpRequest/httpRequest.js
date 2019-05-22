import axios from 'axios';
import { Method, ContentType } from 'enums/common';
import { appendPrefixSlash, removeSuffixSlash, log, isString, isFormData, isArray, isEmpty, isNotEmpty, isBlank, isNotBlank, isFunction } from 'helpers/util';

// global settings
var defaults = {
    // axios的默认参数
    method: Method.GET,
    // paramsSerializer: serializeData,
    responseType: 'json',
    // withCredentials: true,                    // 跨域请求带认证信息，譬如 Cookie, SSL Certificates，HTTP Authentication
    // 扩展的属性默认值
    contentType: ContentType.APPLICATION_JSON,
    // proxyPath: '/proxy',
    isDev: false
};
var requestInterceptors;
var responseInterceptors;

Promise.prototype.done = function(onFulfilled, onRejected) {
    this.then(onFulfilled, onRejected)
        .catch(function(reason) {
            // 抛出一个全局错误
            setTimeout(() => {
                throw reason;
            }, 0);
        });
};

Promise.prototype.finally = function(callback) {
    let P = this.constructor;
    return this.then(
        value => P.resolve(callback(value)).then(() => value),
        reason => P.resolve(callback(reason)).then(() => {
            throw reason;
        })
    );
};

function hasEntityBody(method = '') {
    return [Method.POST, Method.PUT, Method.PATCH].includes(method.toLowerCase());
}

function adjustBaseURL(baseURL) {
    if (baseURL) {
        baseURL = baseURL.trim();
        baseURL = removeSuffixSlash(baseURL);
    // 解决 baseURL 为 0, false, ''的情况
    } else {
        baseURL = null;
    }
    
    return baseURL;
}

function adjustURL(url) {
    if (url) {
        url = url.trim();
        url = appendPrefixSlash(url);
    }

    return url;
}

function formatOptions(opts) {
    if (!opts) {
        return;
    }

    var { baseURL, url, method, contentType } = opts;

    return Object.assign(opts, {
        baseURL: adjustBaseURL(baseURL),
        url: adjustURL(url),
        method: method?.toLowerCase(),
        contentType: contentType?.toLowerCase()
    });
}

function handleHeaders(options, isXHR) {
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

function handleCache(options) {
    var { params, cache } = options;
    var _params = Object.assign({}, params);

    // 增加缓存
    if (!cache) {
        _params.t = new Date().getTime();
    }

    return _params;
}

function handleProxyPath(options) {
    if (!options) {
        return '';
    }

    var { baseURL, proxyPath } = options;
    var _baseURL;
    
    // 为 url 增加代理服务拦截的path
    if (proxyPath) {
        // 如果是方法则交给方法处理
        if (isFunction(proxyPath)) {
            _baseURL = proxyPath(options);
        // 如果是字符串则加在请求的 URL 最前面, 并移除原有请求的 Host 部分.
        } else if (isString(proxyPath)) {
            _baseURL = proxyPath.replace(/(\/)$/, '');
            // 根路径加上 "/" 请求当前dev服务
            _baseURL = appendPrefixSlash(_baseURL);
            if (isNotBlank(baseURL)) {
                // 根路径后加上非 Host 部分路径, 如: /api
                _baseURL = _baseURL + baseURL.replace(/^(http[s]?:)?\/\//, '')
                    .replace(/^[\w\.:]+/, '');
            }
        }
    } else {
        _baseURL = baseURL;
    }

    return _baseURL;
}

// 用于处理用户手动调用的 reject(), 关注性能问题
function handleReject(reject, options) {
    var { isDev, onError } = options;

    return function(error) {
        if (isDev) {
            console.error(error);
        }

        onError?.(error);
        reject(error);
    };
}

export function prepare(options) {
    if (isEmpty(options)) {
        return;
    }

    if (isBlank(options.baseURL) && isBlank(options.url)) {
        return;
    }

    var _opts = Object.assign({}, defaults, options);
    var { url = '', method, paramsSerializer } = formatOptions(_opts);
    var _url = url;
    
    // 处理 header
    _opts.headers = handleHeaders(_opts);

    // 处理代理路径
    var _baseURL = handleProxyPath(_opts) || '';
    
    // 处理缓存
    var _params = handleCache(_opts);
    // var _data = handleData(_opts);

    // 处理 requestInterceptor(config)
    _opts = _opts.requestInterceptor && _opts.requestInterceptor(_opts) || _opts;

    // 处理 transformRequest(data, header)
    if (isArray(_opts.transformRequest)) {
        _opts.transformRequest.forEach((transform) => {
            _opts.data = transform(_opts.data, _opts.headers);
        });
    }
    
    // 序列化 params
    if (paramsSerializer) {
        _params = paramsSerializer(_params);
    }

    return {
        method,
        headers: _opts.headers,
        url: _baseURL + _url,
        params: _params,
        data: _opts.data,
        toString() {
            return this.url + '?' + this.params;
        }
    };
}

export function httpRequest(opts) {
    if (isEmpty(opts)) {
        return Promise.reject('options is required.');
    }

    if (isBlank(opts.url)) {
        return Promise.reject('url is required.');
    }

    var prePromise;
    var _opts = Object.assign({}, defaults, opts);
    var beforeRequest = _opts.beforeRequest;
    
    formatOptions(_opts);

    // 请求前预处理
    if (beforeRequest) {
        prePromise = new Promise(function(resolve, reject) {
            beforeRequest(resolve, reject, _opts);
        });
    } else {
        prePromise = Promise.resolve(_opts);
    }

    return new Promise(function(resolve, reject) {

        prePromise.then(function(options) {
            var {
                // axios参数
                baseURL,
                url = '',
                method,
                headers,
                params,
                data,
                paramsSerializer,
                // 扩展的参数
                cache,
                cancel,
                contentType,
                requestInterceptor,
                responseInterceptor,
                afterResponse,
                onError,
                proxyPath,
                isDev,
                // axios其他参数
                ...other            
            } = options;
          
            if (isDev) {
                log({ url, baseURL, method, data, params }, 'Request');
            }
        
            const instance = axios.create();
            // 处理请求拦截器 requestInterceptor = function or [success, error]
            if (requestInterceptor) {
                // requestInterceptors = requestInterceptors || {};
                let reqSuccess, reqError;
                if (isFunction(requestInterceptor)) {
                    reqSuccess = requestInterceptor;
                } else {
                    reqSuccess = requestInterceptor[0];
                    reqError = requestInterceptor[1];
                }
                // 该实例在注销 interceptor 时使用
                let reqInterceptor = instance.interceptors.request.use(reqSuccess, reqError);
            }
            // 处理响应拦截器 responseInterceptor = function or [success, error]
            if (responseInterceptor) {
                // responseInterceptors = responseInterceptors || {};
                let respSuccess, respError;
                if (isFunction(responseInterceptor)) {
                    respSuccess = responseInterceptor;
                } else {
                    respSuccess = responseInterceptor[0];
                    respError = responseInterceptor[1];
                }
                // 该实例在注销 interceptor 时使用
                let respInterceptor = instance.interceptors.response.use(respSuccess, respError);
            }
            
            // 调用 axios 库
            instance.request({
                headers: handleHeaders(options, true),
                method,
                baseURL: handleProxyPath(options),
                url,
                params: handleCache(options),
                paramsSerializer,
                data,
                // data: handleData(options),
                cancelToken: cancel && new axios.CancelToken(cancel),
                ...other
            }).then(function(response) {
                var { config, request, headers, status, statusText, data } = response;

                if (isDev) {
                    log(response.data, 'Response');
                }

                // 配置了响应拦截器, 自行处理 resolve 和 reject 状态.
                if (afterResponse) {
                    afterResponse(resolve, handleReject(reject, options), response, options);
                } else {
                    resolve(response);
                }
            }).catch(function(error) {
                var { config, request, response, message, stack } = error;
              
                if (response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Response Error:', message);
                } else if (request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    console.error('Nonresponse Error:', message);
                } else if (config) {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Setting up Error:', message);
                } else {
                    // afterResponse 抛出的错误
                    console.error('AfterResponse Error:', message);
                }

                if (isDev) {
                    console.error(error);
                }

                onError?.(error);
    
                reject(error);
            });
        }, function(error) {
            // beforeRequest 抛出的错误
            reject(error);
        });
    });
}

httpRequest.settings = function(options) {
    Object.assign(defaults, options);
};

httpRequest.instance = function(defaultOpts) {
    return function(opts) {
        var _opts = Object.assign({}, defaultOpts, opts);
        return httpRequest(_opts);
    };
};

httpRequest.ejectRequestInterceptor = function(interceptor) {
    // var instance = requestInterceptors[interceptor];
    // instance && instance.interceptors.request.eject(interceptor);
    // TODO: 
};

httpRequest.ejectResponseInterceptor = function(interceptor) {
    // var instance = responseInterceptors[interceptor];
    // instance && instance.interceptors.request.eject(interceptor);
    // TODO: 
};

