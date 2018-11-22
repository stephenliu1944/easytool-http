import qs from 'qs';
import axios from 'axios';
import { HttpMethod, ContentType } from 'constants/enum';
import { isString, isFormData, isIE, isEmpty, isNotEmpty, isFunction, log } from 'utils/util';

/**
 * @author Stephen Liu
 * @desc 使用axios第三方库访问后台服务器, 返回封装过后的Promise对象.
 * @param {axios.options...} 支持全系axios参数.
 * @param {boolean} cache 是否开启缓存, 开起后每次请求会在url后加一个时间搓, 默认false.
 * @param {function} cancel 封装了CancelToken
 * @param {string} contentType HTTP请求头的 Content-Type, 默认为'application/json'
 * @param {function} requestInterceptor 封装了axios的interceptors.request.use().
 * @param {function} responseInterceptor 封装了axios的interceptors.response.use().
 * @param {function} resolveInterceptor 在resolve之前拦截resolve, 可进一步根据返回数据决定是resolve还是reject.
 * @param {function} serverError 在服务端返回异常时调用.
 * @param {function} browserError 在浏览器抛出异常时调用.
 * @param {string | function} proxyPath 配置请求代理服务器的前缀, 可以是字符串也可以是一个返回字符串的方法, 方法接收一个配置参数.
 * @param {boolean} isDev 是否为调试模式, 调试模式会打一些log.
 * @return {object} - 返回一个promise的实例对象.
 */
function HttpRequest(options) {
    // 默认配置
    var _options = Object.assign({
        // axios的默认参数
        method: HttpMethod.GET,                      
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
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
                        console.error('无法将响应数据转换为 json 对象', e, data);
                    }
                }
    
                return data;
            }
        ],
        // 扩展的默认参数
        contentType: ContentType.JSON             
    }, HttpRequest.defaults, options);

    var {
        // axios参数
        url,
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
        requestInterceptor,
        responseInterceptor,
        resolveInterceptor,
        serverError,
        browserError,
        proxyPath,
        isDev,
        // axios其他参数
        ...other
    } = _options;

    if (isEmpty(url)) {
        return Promise.reject();
    } else if (!/^\//.test(url)) {
        url = '/' + url;
    }
    
    if (isDev) {
        log({ url, baseURL, method, data, params }, 'Request');
    }

    if (!cache) {
        params = params || {};
        params.t = new Date().getTime();
    }
    
    // 为 url 增加代理服务拦截的path
    if (proxyPath && contentType !== ContentType.URL) {
        baseURL = null;
        let prefix = isFunction(proxyPath) ? proxyPath(_options) : proxyPath;
        url = `/${ prefix + url }`;
    }

    var promise = new Promise(function(resolve, reject) {
        // 请求一个二进制文件
        if (contentType === ContentType.URL) {
            try {
                url += `?${qs.stringify(params, { allowDots: true })}`;
                resolve(url);
            } catch (e) {
                reject(e);
            }
        } else {
            const instance = axios.create();

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
            }, function(error) {
                var errorMsg;
                
                // 服务端异常
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response) {
                    errMsg = error.response;

                    if (serverError) {
                        serverError(errorMsg);
                    }
                // 浏览器抛出的异常, 比如请求超时, 不同浏览器可能有不同的行为.
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                } else if (error.request) {
                    errorMsg = error.request;
                    if (browserError) {
                        browserError(errorMsg);
                    }
                // 浏览器抛出的异常, 比如请求超时, 不同浏览器可能有不同的行为.
                // Something happened in setting up the request that triggered an Error
                } else {
                    errorMsg = error.message;
                    if (browserError) {
                        browserError(errorMsg);
                    }
                }                
                
                if (isIE()) {
                    console.error(JSON.stringify(errorMsg));
                } else {
                    console.error(errorMsg);
                }

                reject(errorMsg);
            });
        }
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

export default HttpRequest;