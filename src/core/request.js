import axios from 'axios';
import { log } from 'utils/log';
import { hashObject } from 'utils/hash';
import { isEmpty, isBlank, isFormData } from 'utils/common';
import prepareRequest from './prepareRequest';
import { defaults, getNormalizedOptions } from './defaults';
import { handleHeaders, handleCache, handleProxyURL, handleReject, handleBeforeRequest, handleDefaultInterceptors, handleCancelToken } from './handler';

if (typeof Promise.prototype.done !== 'function') {
    Promise.prototype.done = function(onFulfilled, onRejected) {
        this.then(onFulfilled, onRejected)
            .catch(function(reason) {
            // 抛出一个全局错误
                setTimeout(() => {
                    throw reason;
                }, 0);
            });
    };
}

if (typeof Promise.prototype.finally !== 'function') {
    Promise.prototype.finally = function(callback) {
        let P = this.constructor;
        return this.then(
            value => P.resolve(callback(value)).then(() => value),
            reason => P.resolve(callback(reason)).then(() => {
                throw reason;
            })
        );
    };
}

// TODO: sourceList未设置上限, 可能有内存问题, 如果用户调用了 CancelToken.source() 又没有配置 cancelToken 的情况下, 无法清除.
const sourceList = [];
const pendingRequests = {};
const CancelToken = axios.CancelToken;

function preventable(options) {
    let { preventDuplicate, data } = options;

    return preventDuplicate && !isFormData(data);
}

function removeSourceByCancelToken(token) {
    const index = sourceList.findIndex(source => source.token === token);
    index !== -1 && sourceList.splice(index, 1);
}

function createSource() {
    return HTTPRequest.CancelToken.source();
}

// 关联 axios 对象
HTTPRequest.axios = axios;
// 封装 CancelToken
HTTPRequest.CancelToken = handleCancelToken(CancelToken, sourceList);
// 与axios保持一致, 设置全局配置属性, 用 httpRequest.defaults 配置默认值
HTTPRequest.defaults = function(options) {
    Object.assign(defaults, options);
    // 配置默认的拦截器, 只能配一个.
    handleDefaultInterceptors(defaults, HTTPRequest.interceptors);
};
// 与axios保持一致, 用 create 方法创建实例, 但与 axios 不同在于该方法创建的实例还是用 axios 对象做请求, 不会重新创建一个 instance 实例.
// TODO: instance实例有很多缺陷, 方法不全, 需要较大重构.
HTTPRequest.create = function(defaultOpts) {
    function _instance(opts) {
        let _opts = Object.assign({}, defaultOpts, opts);
        return HTTPRequest(_opts);
    }

    _instance.prepareRequest = function(opts) {
        let _opts = Object.assign({}, defaultOpts, opts);
        return prepareRequest(_opts);
    };
 
    return _instance;
};
// interceptors 封装
HTTPRequest.interceptors = {
    request: {
        use(resolve, reject, options) {
            return axios.interceptors.request.use(resolve, reject, options); 
        },
        eject(interceptor) {
            axios.interceptors.request.eject(interceptor);
        },
        // 新版本才有该方法
        clear() {
            axios.interceptors.request?.clear();
        }
    },
    response: {
        use(resolve, reject, options) {
            return axios.interceptors.response.use(resolve, reject, options); 
        },
        eject(interceptor) {
            axios.interceptors.response.eject(interceptor);
        },
        // 新版本才有该方法
        clear() {
            axios.interceptors.response?.clear();
        }
    }
};

HTTPRequest.getPendingRequests = function() {
    return pendingRequests;
};
// 终止所有网络请求
HTTPRequest.abortAll = function(message) {
    sourceList.forEach(source => {
        source.cancel(message);
        source.canceled = true;
    });
    sourceList.length = 0;
};

export function HTTPRequest(rawOptions) {
    if (isEmpty(rawOptions)) {
        throw 'options is required.';
    }

    if (isBlank(rawOptions.url)) {
        throw 'url is required.';
    }
    
    // 合并默认配置选项
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

    // 每次请求都需要 cancelToken, 没有则生成一个, 否则无法获取所有请求的 source.
    let _cancelToken = applyDefaultOptions.cancelToken || createSource().token;
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
                cancelToken = _cancelToken,
                contentType,
                afterResponse,
                onError,
                proxyURL,
                isDev,
                preventDuplicate,
                // axios其他参数
                ...other            
            } = _opts;

            if (isDev) {
                log({ url, baseURL, method, data, params }, 'Request');
            }

            // 调用 axios 库
            axios.request({
                headers: handleHeaders(_opts, true),
                method,
                baseURL: handleProxyURL(_opts),
                url,
                params: handleCache(_opts),
                paramsSerializer,
                data,
                // TODO: signal: new AbortController().signal             // Starting from v0.22.0 Axios supports AbortController 
                cancelToken, 
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
                let { config, request, response, message = '', stack = '' } = error;
                let errorType;

                if (response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    errorType = '[Response Error]';
                } else if (request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    errorType = '[Nonresponse Error]';
                } else {
                    // Something happened in setting up the request that triggered an Error
                    errorType = '[Error]';
                } 

                if (isDev) {
                    console.error(errorType);
                    console.error(error);
                }

                onError && onError(error);
    
                reject(error);
            }).finally(function() {
                // 从 sourceList 中移除已经响应的网络请求
                removeSourceByCancelToken(cancelToken);
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