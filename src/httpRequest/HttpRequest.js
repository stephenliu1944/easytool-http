import qs from 'qs';
import axios from 'axios';
import { isString, isFormData, isIE, isEmpty, isNotEmpty, isBlank, isNotBlank, isFunction } from '@beancommons/utils';
import { HttpMethod, ContentType, ReturnType } from 'constants/enum';
import { appendPrefixSlash, removeSuffixSlash, log } from 'utils/commons';

// global settings
var defaults = {
    // axios的默认参数
    method: HttpMethod.GET,
    paramsSerializer: function(params) {
        return qs.stringify(params, { allowDots: true });
    },
    // withCredentials: true,                    // 跨域请求带认证信息，譬如 Cookie, SSL Certificates，HTTP Authentication
    transformResponse: [
        // 默认转成json格式
        function(data) {
            if (isString(data)) {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error('Can not parse response data to json object, please check the data format: ', e, data);
                }
            }

            return data;
        }
    ],
    // 扩展的属性默认值
    contentType: ContentType.JSON,
    proxyPath: '/proxy',
    enableProxy: false,
    isDev: false
};

export function settings(opts) {
    Object.assign(defaults, opts);
}

export function prepare(opts) {
    url = url?.trim() || '';

    url = appendPrefixSlash(url);
    
    // 不缓存请求, 则在末尾增加时间搓
    if (!cache && isNotBlank(url)) {
        params = params || {};
        params.t = new Date().getTime();
    }
    
    // 为 url 增加代理服务拦截的path
    if (enableProxy) {
        let proxyURL = isFunction(proxyPath) ? proxyPath(_opts) : proxyPath;
        
        // 为baseURL补充上非域名部分的rootPath, 但是 BASE_URL_REG正则有bug, 且造成代码混乱, 估暂时移除.
        // var match = baseURL?.match(BASE_URL_REG) || [];
        // baseURL = appendPrefixSlash(prefix) + appendPrefixSlash(match[4]);     

        // 请求当前dev服务器
        baseURL = appendPrefixSlash(proxyURL); 
    }

    // 只返回一个经过处理的url, 请求一个二进制文件
    if (returnType.toLowerCase() === ReturnType.URL) {
        if (params) {
            url += `?${qs.stringify(params, { allowDots: true })}`;
        }

        let returnURL = removeSuffixSlash(baseURL) + url;

        return returnURL;
    }
}

function processURL(opts) {
    var {
        url,
        baseURL,
        proxyPath,
        enableProxy
    } = opts;

    1.; // baseUrl和url代码健壮性处理
    url = url?.trim() || '';

    url = appendPrefixSlash(url);

    baseURL;

    2.; // 代理处理

    // 为 url 增加代理服务拦截的path
    if (enableProxy) {
        let proxyURL = isFunction(proxyPath) ? proxyPath(opts) : proxyPath;
        // 请求当前dev服务器
        baseURL = appendPrefixSlash(proxyURL);
    }

    return {

    };
}

// 正则获取baseURL中的 protocol, host, port, rootPath 部分.
// TODO: 如果baseURL格式为 '/xxx'则不能匹配到, 但是'xxx'和'xxx/'可以匹配到.
// const BASE_URL_REG = /^(https?:\/\/)?([\w-\.]+)(:[\d]{1,})?(\/[\/\w-\.\?#=%]*)*/;
/**
 * @author Stephen Liu
 * @desc 使用axios第三方库访问后台服务器, 返回封装过后的Promise对象.
 * @param {axios.options...} 支持全系axios参数.
 * @param {boolean} cache 是否开启缓存, 开起后每次请求会在url后加一个时间搓, 默认false.
 * @param {function} cancel 封装了CancelToken
 * @param {string} contentType HTTP请求头的 Content-Type, 默认为'application/json'
 * @param {string} returnType 方法返回的数据类型, 可选: 'promise', 'url', 默认为 promise.
 * @param {function} requestInterceptor 封装了axios的interceptors.request.use().
 * @param {function} responseInterceptor 封装了axios的interceptors.response.use().
 * @param {function} beforeRequest 在请求之前进行一些预处理, 接收3个参数 resolve, reject, options.
 * @param {function} afterResponse 在响应返回后进一步处理, 接收4个参数, resolve, reject, response, options.
 * @param {function} onError 在请求返回异常时调用.
 * @param {boolean} enableProxy 是否开启代理服务, will replace baseURL with proxyPath, default is false.
 * @param {string | function} proxyPath proxy path, can be string or function, the function receive a options args and return a string, default is "/proxy."
 * @param {boolean} isDev 是否为调试模式, 调试模式会打一些log.
 * @param {object} extension custom data field.
 * @return {object} - 返回一个promise的实例对象.
 */
function HttpRequest(opts) {
    var _opts = {};

    var { url, beforeRequest } = Object.assign(_opts, defaults, opts);

    if (isBlank(url)) {
        return Promise.reject('url is required.');
    }

    var prePromise;
    // 请求前预处理
    if (beforeRequest) {
        prePromise = new Promise(function(resolve, reject) {
            beforeRequest(resolve, reject, _opts);
        });
    } else {
        prePromise = Promise.resolve(_opts);
    }

    return new Promise(function(resolve, reject) {
        prePromise.then((options) => {
            var {
                // axios参数
                url = '',
                baseURL,
                method,
                headers,
                params,
                data,
                paramsSerializer,
                // 扩展的参数
                cache,
                cancel,
                contentType,
                returnType,
                requestInterceptor,
                responseInterceptor,
                afterResponse,
                onError,
                enableProxy,
                proxyPath,
                isDev,
                // axios其他参数
                ...other            // 注意 other
            } = options;

            // TODO: 正常方法调用
        }, (error) => {
            reject(error);
        });
    });

    url = url?.trim() || '';

    url = appendPrefixSlash(url);
    
    if (isDev) {
        log({ url, baseURL, method, data, params }, 'Request');
    }
    
    // 为 url 增加代理服务拦截的path
    if (enableProxy) {
        let proxyURL = isFunction(proxyPath) ? proxyPath(_opts) : proxyPath;
        
        // 为baseURL补充上非域名部分的rootPath, 但是 BASE_URL_REG正则有bug, 且造成代码混乱, 估暂时移除.
        // var match = baseURL?.match(BASE_URL_REG) || [];
        // baseURL = appendPrefixSlash(prefix) + appendPrefixSlash(match[4]);     
        
        // 请求当前dev服务器
        baseURL = appendPrefixSlash(proxyURL); 
    }

    // 不缓存请求, 则在末尾增加时间搓
    if (!cache && isNotBlank(url)) {
        params = params || {};
        params.t = new Date().getTime();
    }
    
    // 只返回一个经过处理的url, 请求一个二进制文件
    if (returnType.toLowerCase() === ReturnType.URL) {
        if (params) {
            url += `?${qs.stringify(params, { allowDots: true })}`;
        }

        let returnURL = removeSuffixSlash(baseURL) + url;

        if (isDev) {
            /* eslint-disable no-console */
            console.log('Return URL: ', returnURL);
            /* eslint-enable no-console */
        }
        return returnURL;
    }

    var promise = new Promise(function(resolve, reject) {
        const instance = axios.create();
        
        headers = headers || {};
        headers['X-Requested-With'] = 'XMLHttpRequest';

        if (method === HttpMethod.POST) {
            headers['Content-Type'] = contentType;

            if (isNotEmpty(data)) {
                switch (contentType) {
                    // contentType 为 'application/x-www-form-urlencoded' 的请求将参数转化为 formData 传递
                    case ContentType.FORM_URLENCODED:
                        if (!isFormData(data)) {
                            data = qs.stringify(data, { allowDots: true });
                        }
                        // TODO: 更多兼容性处理.
                        break;
                }
            }
        }
        
        if (requestInterceptor) {
            instance.interceptors.request.use(function(config) {
                return requestInterceptor(config) || config;
            }, function(error) {
                return reject(error);
            });
        }

        if (responseInterceptor) {
            instance.interceptors.response.use(function(response) {
                return responseInterceptor(response) || response;
            }, function(error) {
                return reject(error);
            });
        }

        // 调用 axios 库
        instance.request({
            method,
            baseURL,
            url,
            params,
            paramsSerializer: params && paramsSerializer,
            data,
            headers,
            cancelToken: cancel && new axios.CancelToken(cancel),
            other
        }).then(function(response) {
            if (isDev) {
                log(response.data, 'Response');
            }

            // 配置了响应拦截器, 自行处理 resolve 和 reject 状态.
            if (afterResponse) {
                afterResponse(resolve, reject, response.data, _opts);
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
    });

    return promise;
}

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

// 根据 prefix + baseURL 生成代理拦截的 url
export function proxyBaseURL(options = {}, prefix = 'proxy') {
    var { baseURL } = options;

    if (isBlank(baseURL)) {
        return '';
    }

    /**
     * 获取url的host和port部分, 此正则有缺陷, 详见顶部.
     */ 
    // var match = baseURL?.match(BASE_URL_REG) || [];
    // var host = match[2] || '';
    // var port = match[3] || '';
    // var proxyURL = host + port;

    // if (isBlank(proxyURL)) {
    //     return;
    // }

    var proxyURL = baseURL.replace(/(^http[s]?:\/\/)/, '')
        .replace(/(\/)$/, '')
        .replace(':', '_');     // TODO: 把 _ 替换成 \: 试试

    return `/${prefix}/${proxyURL}`;
}

export default HttpRequest;