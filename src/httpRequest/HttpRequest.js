import qs from 'qs';
import axios from 'axios';
import { HttpMethod, ContentType, ReturnType } from 'constants/enum';
import { isString, isFormData, isIE, isEmpty, isNotEmpty, isBlank, isNotBlank, isFunction } from '@beancommons/utils';

// url增加起始或末尾斜杠"/"
function appendSlash(url, suffix) {
    if (isBlank(url)) {
        return url;
    }
    
    if (suffix && !/\/$/.test(url)) {
        url += '/';
    } else if (!/^\//.test(url)) {
        url = '/' + url;
    }

    return url;
}
// url 移除起始或末尾斜杠"/"
function removeSlash(url, suffix) {
    if (isBlank(url)) {
        return url;
    }
    
    if (suffix && /\/$/.test(url)) {
        url = url.slice(0, -1);
    } else if (/^\//.test(url)) {
        url = url.slice(1);
    }

    return url;
}

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
 * @param {function} resolveInterceptor 在resolve之前拦截resolve, 可进一步根据返回数据决定是resolve还是reject.
 * @param {function} onError 在请求返回异常时调用.
 * @param {boolean} enableProxy 是否开启代理服务, 会将 baseURL 设置为null,并且在 url 上添加代理信息, 默认 false.
 * @param {string | function} proxyPath 代理的路径, 可以为方法返回一个string, 默认为"/proxy."
 * @param {boolean} isDev 是否为调试模式, 调试模式会打一些log.
 * @return {object} - 返回一个promise的实例对象.
 */
function HttpRequest(options) {
    // 方法默认配置参数
    var _options = Object.assign({
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
        returnType: ReturnType.PROMISE,
        proxyPath: '/proxy',
        enableProxy: false,
        isDev: false
    }, HttpRequest.defaults, options);

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
        resolveInterceptor,
        onError,
        enableProxy,
        proxyPath,
        isDev,
        // axios其他参数
        ...other
    } = _options;

    if (isEmpty(url) && returnType.toLowerCase() !== ReturnType.URL) {
        return Promise.reject();
    }

    url = url?.trim() || '';

    url = appendSlash(url);
    
    if (isDev) {
        log({ url, baseURL, method, data, params }, 'Request');
    }

    if (!cache) {
        params = params || {};
        params.t = new Date().getTime();
    }
    
    // 为 url 增加代理服务拦截的path
    if (enableProxy) {
        let prefix = isFunction(proxyPath) ? proxyPath(_options) : proxyPath;
        prefix = appendSlash(prefix);
        url = prefix + url;

        // 请求当前dev服务器
        baseURL = null;     // TODO: baseURL可能不止含有域名, 可能还有路径信息
    }

    // 请求一个二进制文件
    if (returnType.toLowerCase() === ReturnType.URL) {
        if (isNotBlank(baseURL)) {
            url = removeSlash(baseURL, true) + url;
        }

        if (params) {
            url += `?${qs.stringify(params, { allowDots: true })}`;
        }

        if (isDev) {
            console.log('Proxy URL: ', url);
        }

        return url;
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
            if (resolveInterceptor) {
                resolveInterceptor(response.data, _options, resolve, reject);
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

function log(data, title) {
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

export default HttpRequest;