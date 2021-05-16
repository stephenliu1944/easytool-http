import xhr from 'utils/xhr';
import { log } from 'utils/log';
import { hashObject } from 'utils/hash';
import { isEmpty, isBlank, isFormData } from 'utils/common';
import prepareRequest from './prepareRequest';
import { defaults, getNormalizedOptions } from './defaults';
import { handleHeaders, handleCache, handleProxyPath, handleReject, handleBeforeRequest, handleInterceptor } from './handler';

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

const pendingRequests = {};

function preventable(options) {
    let { preventRepeat, data } = options;

    return preventRepeat && !isFormData(data);
}

export function httpRequest(rawOptions) {
    if (isEmpty(rawOptions)) {
        throw 'options is required.';
    }

    if (isBlank(rawOptions.url)) {
        throw 'url is required.';
    }
    
    let applyDefaultOptions = Object.assign({}, defaults, rawOptions);
    // TODO: repeat模式: first, last, throttle, debounce
    let rawOptionsHash;

    // 避免重复请求, formData无法处理(objecthash会报错, 无效对象), first模式
    // TODO: 处理formData格式
    if (preventable(applyDefaultOptions)) {
        rawOptionsHash = hashObject(rawOptions);
        let pendingRequest = pendingRequests[rawOptionsHash];

        if (pendingRequest) {
            return pendingRequest;
        }
    }
    // last 需要 abort 之前发出的未响应的请求

    let request = new Promise(function(resolve, reject) {
        // 请求前预处理
        let beforeRequest = handleBeforeRequest(applyDefaultOptions);

        beforeRequest.then(function(options) {
            if (isEmpty(options)) {
                throw 'options is required when call reslove(options) in beforeRequest.';
            }

            let _opts = getNormalizedOptions(options);
            let {
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
                preventRepeat,
                // axios其他参数
                ...other            
            } = _opts;
            let requestInterceptorInstance;
            let responseInterceptorInstance;

            // 创建一个 axios 实例
            const instance = xhr.create();

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
                cancelToken: cancel && new xhr.CancelToken(cancel),
                ...other
            }).then(function(response) {
                let { config, request, headers, status, statusText, data } = response;

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
                let { config, request, response, message, stack } = error;
              
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
                // 请求结束后则删除缓存, 主要解决第一次请求还未得到响应时又发出相同的请求.
                delete pendingRequests[rawOptionsHash];
            });
        }, function(error) {
            // beforeRequest 抛出的错误
            reject(error);
        });
    });

    // 缓存请求
    if (preventable(applyDefaultOptions)) {
        pendingRequests[rawOptionsHash] = request;
    }

    return request;
}

httpRequest.settings = function(options) {
    Object.assign(defaults, options);
};
// instance 共享同一个 pendingRequests
httpRequest.instance = function(defaultOpts) {
    function _instance(opts) {
        let _opts = Object.assign({}, defaultOpts, opts);
        return httpRequest(_opts);
    }

    _instance.prepareRequest = function(opts) {
        let _opts = Object.assign({}, defaultOpts, opts);
        return prepareRequest(_opts);
    };
 
    return _instance;
};

httpRequest.getPendingRequests = function() {
    return pendingRequests;
};

httpRequest.ejectRequestInterceptor = function(interceptor) {
    // let instance = requestInterceptors[interceptor];
    // instance && instance.interceptors.request.eject(interceptor);
    // TODO: 
};

httpRequest.ejectResponseInterceptor = function(interceptor) {
    // let instance = responseInterceptors[interceptor];
    // instance && instance.interceptors.request.eject(interceptor);
    // TODO: 
};

