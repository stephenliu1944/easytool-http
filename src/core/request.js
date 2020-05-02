import axios from 'axios';
import { defaults, initOptions } from './defaults';
import prepareRequest from './prepareRequest';
import { handleHeaders, handleCache, handleProxyPath, handleReject, handleBeforeRequest, handleInterceptor } from './handler';
import { log, isEmpty, isBlank } from 'utils/common';

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
            var requestInterceptorInstance;
            var responseInterceptorInstance;
            // 创建一个 axios 实例
            const instance = axios.create();

            if (isDev) {
                log({ url, baseURL, method, data, params }, 'Request');
            }
            
            // 处理请求拦截器 requestInterceptor = function or [success, error]
            if (requestInterceptor) {
                let use = handleInterceptor(requestInterceptor);
                // 该实例在注销 interceptor 时使用
                requestInterceptorInstance = instance.interceptors.request.use(use.success, use.error);
            }
            // 处理响应拦截器 responseInterceptor = function or [success, error]
            if (responseInterceptor) {
                let use = handleInterceptor(responseInterceptor);
                // 该实例在注销 interceptor 时使用
                responseInterceptorInstance = instance.interceptors.response.use(use.success, use.error);
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
                cancelToken: cancel && new axios.CancelToken(cancel),
                ...other
            }).then(function(response) {
                var { config, request, headers, status, statusText, data } = response;

                if (isDev) {
                    log(response.data, 'Response');
                }

                // 配置了响应拦截器, 自行处理 resolve 和 reject 状态.
                if (afterResponse) {
                    let rejectWrapper = handleReject(reject, response, _opts);
                    afterResponse(resolve, rejectWrapper, response, _opts);
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
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Error:', message);
                } 

                if (isDev) {
                    console.error(error);
                }

                onError && onError(error);
    
                reject(error);
            }).finally(function() {
                requestInterceptorInstance && instance.interceptors.request.eject(requestInterceptorInstance);
                responseInterceptorInstance && instance.interceptors.response.eject(responseInterceptorInstance);
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

    _instance.prepareRequest = function(opts) {
        var _opts = Object.assign({}, defaultOpts, opts);
        return prepareRequest(_opts);
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

