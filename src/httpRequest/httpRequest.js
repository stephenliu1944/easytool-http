import qs from 'qs';
import axios from 'axios';
import { Method, ContentType } from 'enums/common';
import { appendPrefixSlash, removeSuffixSlash, log, isString, isFormData, isIE, isEmpty, isNotEmpty, isBlank, isNotBlank, isFunction } from 'utils/common';

// global settings
var defaults = {
    // axios的默认参数
    method: Method.GET,
    paramsSerializer: serializeData,
    responseType: 'json',
    // withCredentials: true,                    // 跨域请求带认证信息，譬如 Cookie, SSL Certificates，HTTP Authentication
    // 扩展的属性默认值
    contentType: ContentType.JSON,
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

function createTimestamp() {
    return new Date().getTime();
}

function serializeData(params, options = {}) {
    var data = qs.stringify(params, options);   // 默认返回空的字符串, 不会返回null

    return data;
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

function handleHeaders(options) {
    var { headers, method, contentType } = options;
    var _headers = Object.assign({}, headers);
    
    _headers['X-Requested-With'] = 'XMLHttpRequest';

    if (hasEntityBody(method)) {
        _headers['Content-Type'] = contentType;
    }

    return _headers;
}

function handleParams(options) {
    var { params, cache } = options;
    var _params = Object.assign({}, params);

    if (!cache) {
        _params.t = createTimestamp();
    }

    return _params;
}

function handleData(options) {
    var { data, method, contentType, dataSerializer } = options;
    
    if (isEmpty(data)) {
        return;
    }

    var _data;
    if (dataSerializer) {
        _data = dataSerializer(data);
    } else if (method === Method.POST 
            && contentType === ContentType.X_WWW_FORM_URLENCODED
            && !isFormData(data)) {
        _data = serializeData(data, {
            allowDots: true
        });
    } else {
        _data = data;
    }
    
    return _data;
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

export function prepare(options) {
    if (isEmpty(options)) {
        return;
    }

    if (isBlank(options.baseURL) && isBlank(options.url)) {
        return;
    }

    var _opts = Object.assign({}, defaults, options);
    var { url = '', paramsSerializer, method } = formatOptions(_opts);
    var _url = url;
    var _baseURL = handleProxyPath(_opts) || '';
    var _headers = handleHeaders(_opts);
    var _params = handleParams(_opts);
    var _data = handleData(_opts);

    if (paramsSerializer) {
        _params = paramsSerializer(_params);
    }

    return {
        method,
        headers: _headers,
        url: _baseURL + _url,
        params: _params,
        data: _data,
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
                dataSerializer,
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

                let reqInterceptor = instance.interceptors.request.use(reqSuccess, reqError);
            }
            // 处理响应拦截器 responseInterceptor = function or [success, error]
            if (responseInterceptor) {
                // responseInterceptors = responseInterceptors || {};
                let respSuccess, respError;
                if (isFunction(responseInterceptor)) {
                    reqSuccess = responseInterceptor;
                } else {
                    reqSuccess = responseInterceptor[0];
                    reqError = responseInterceptor[1];
                }
                let respInterceptor = instance.interceptors.response.use(respSuccess, respError);
            }
    
            // 调用 axios 库
            instance.request({
                headers: handleHeaders(options),
                method,
                baseURL: handleProxyPath(options),
                url,
                params: handleParams(options),
                paramsSerializer,
                data: handleData(options),
                cancelToken: cancel && new axios.CancelToken(cancel),
                ...other
            }).then(function(response) {
                if (isDev) {
                    log(response.data, 'Response');
                }
    
                // 配置了响应拦截器, 自行处理 resolve 和 reject 状态.
                if (afterResponse) {
                    afterResponse(resolve, reject, response.data, options);
                } else {
                    resolve(response.data);
                }
            }).catch(function(error) {
                var errorMsg;
                // 服务端异常
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response) {
                    errorMsg = error.response;
                // 浏览器抛出的异常, 比如请求超时, 不同浏览器可能有不同的行为.
                // Something happened in setting up the request that triggered an Error
                } else {
                    errorMsg = error.stack || error.message;
                }          
                
                if (isIE()) {
                    console.error(JSON.stringify(errorMsg));
                } else {
                    console.error(errorMsg);
                }
    
                onError?.(errorMsg);
    
                reject(errorMsg);
            });
        }, function(error) {
            reject(error);
        });
    });
}

httpRequest.settings = function(options) {
    Object.assign(defaults, options);
};

httpRequest.instance = function(defaultOpts) {
    return function(opts) {
        var options = Object.assign(defaultOpts, opts);
        return httpRequest(options);
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

