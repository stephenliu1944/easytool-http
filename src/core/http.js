import qs from 'qs';
import axios from 'axios';
import { handleHeaders, handleCache, handleProxyPath, handleReject, handleBeforeRequest, handleTransformData, handleInterceptor } from './handler';
import { transformRequestDefault, transformResponseDefault, transformWrapper } from './transformData';
import { Method, ContentType } from 'enums/common';
import { adjustBaseURL, adjustURL, log, isObject, isEmpty, isBlank } from 'utils/common';

// global settings
var defaults = {
    cache: true,
    // axios的默认参数
    method: Method.GET,
    responseType: 'json',
    // withCredentials: true,                        // 跨域请求带认证信息，譬如 Cookie, SSL Certificates，HTTP Authentication
    // 扩展的属性默认值
    contentType: ContentType.APPLICATION_JSON,
    paramsSerializer(params) {
        if (isObject(params)) {
            return qs.stringify(params, {            
                allowDots: true
            });
        }
        return params;
    },
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

function initOptions(opts) {
    if (!opts) {
        return;
    }

    var { baseURL, url, method, contentType, transformRequest, transformResponse } = opts;

    return Object.assign({}, opts, {
        baseURL: adjustBaseURL(baseURL),
        url: adjustURL(url),
        method: method?.toLowerCase(),
        contentType: contentType?.toLowerCase(),
        transformRequest: handleTransformData(transformRequest, transformRequestDefault, transformWrapper, opts),
        transformResponse: handleTransformData(transformResponse, transformResponseDefault, transformWrapper, opts)
    });
}

export function prepare(options) {
    if (isEmpty(options)) {
        throw 'options is required.';
    }

    if (isBlank(options.url)) {
        throw 'url is required.';
    }

    options = Object.assign({}, defaults, options);
    var beforeRequest = options.beforeRequest;
    
    if (beforeRequest) {
        // TODO: httpRequest是通过resolve(opts)接收的参数, 这里行为不一致
        options = beforeRequest((opts) => opts, (error) => {throw error;}, options) || options;
    }

    var _opts = initOptions(options);
    var { url = '', method, paramsSerializer } = _opts;
    var _url = url;
    
    // 处理 header
    _opts.headers = handleHeaders(_opts);

    // 处理代理路径
    var _baseURL = handleProxyPath(_opts) || '';
    
    // 处理缓存
    _opts.params = handleCache(_opts);
    
    if (_opts.requestInterceptor) {
        let use = handleInterceptor(_opts.requestInterceptor);
        _opts = use.success && use.success(_opts) || _opts;
    }

    // 处理 transformRequest(data, header)
    if (_opts.transformRequest) {
        _opts.transformRequest.forEach((transform) => {
            _opts.data = transform(_opts.data, _opts.headers);
        });
    }
    
    // 序列化 params
    if (paramsSerializer) {
        _opts.params = paramsSerializer(_opts.params);
    }

    return {
        method,
        url: _baseURL + _url,
        headers: _opts.headers,
        params: _opts.params,
        data: _opts.data,
        toString() {
            var url = this.url;
            if (typeof this.params === 'string') {
                url += '?' + this.params;
            } else if (typeof this.params === 'object' && this.params.t) {
                url += '?t=' + this.params.t;
            }
            return url;
        },
        toURL() {
            return this.toString();
        }
    };
}

export function httpRequest(opts) {
    if (isEmpty(opts)) {
        throw 'options is required.';
    }

    if (isBlank(opts.url)) {
        throw 'url is required.';
    }
    
    opts = Object.assign({}, defaults, opts);
    // 请求前预处理
    var beforePromise = handleBeforeRequest(opts);
    
    return new Promise(function(resolve, reject) {

        beforePromise.then(function(options) {
            if (isEmpty(options)) {
                throw 'options is required when call reslove(options) in beforeRequest.';
            }

            var _opts = initOptions(options);

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
            } = _opts;
          
            if (isDev) {
                log({ url, baseURL, method, data, params }, 'Request');
            }
        
            const instance = axios.create();
            // 处理请求拦截器 requestInterceptor = function or [success, error]
            if (requestInterceptor) {
                // requestInterceptors = requestInterceptors || {};
                let use = handleInterceptor(requestInterceptor);
                // 该实例在注销 interceptor 时使用
                let reqInterceptor = instance.interceptors.request.use(use.success, use.error);
            }
            // 处理响应拦截器 responseInterceptor = function or [success, error]
            if (responseInterceptor) {
                // responseInterceptors = responseInterceptors || {};
                let use = handleInterceptor(responseInterceptor);
                // 该实例在注销 interceptor 时使用
                let respInterceptor = instance.interceptors.response.use(use.success, use.error);
            }
            
            // 调用 axios 库
            instance.request({
                headers: handleHeaders(_opts, true),
                method,
                baseURL: handleProxyPath(_opts),
                url,
                params: handleCache(_opts),
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
                    afterResponse(resolve, handleReject(reject, _opts), response, _opts);
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

                onError && onError(error);
    
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
    function _instance(opts) {
        var _opts = Object.assign({}, defaultOpts, opts);
        return httpRequest(_opts);
    }

    _instance.prepare = function(opts) {
        var _opts = Object.assign({}, defaultOpts, opts);
        return prepare(_opts);
    };
 
    return _instance;
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

