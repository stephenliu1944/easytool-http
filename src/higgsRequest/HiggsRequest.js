import qs from 'qs';
import axios from 'axios';
import { HttpMethod, ContentType } from 'constants/enum';
import { isString, isFormData, isIE, isEmpty, isNotEmpty, log, getSubdomain } from 'utils/util';

// 全局配置文件
const globalConfig = {
    // axios的属性
    timeout: 10000,
    method: HttpMethod.GET,                      // 默认请求方式
    transformResponse: [function(data) {
        if (isString(data)) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('无法将响应数据转换为 json 对象', e, data);
            }
        }

        return data;
    }],
    // 扩展的属性
    cache: false,
    contentType: ContentType.JSON,             // API接口请求默认发送的contentType
    // handleResponse: true,                   // 废弃, responseInterceptor替代
    mockPrefix: 'mock',                         
    proxyPrefix: 'proxy',
    isDev: false,
    isMock: false
};

// 全局消息提示显示隐藏事件
// const Event = {
//     // SHOW_LOADING: 'SHOW_LOADING',
//     // HIDE_LOADING: 'HIDE_LOADING',
//     SHOW_ALERT: 'SHOW_ALERT'
// };

// function showLoading(method, isShow) {
//     if (isShow || (isShow === null && method === HttpMethod.POST)) {
//         Emitter.emit(Event.SHOW_LOADING);
//     }
// }

// function hideLoading(config, isShow) {
//     if (isShow || (isShow === null && config.method === HttpMethod.POST)) {
//         Emitter.emit(Event.HIDE_LOADING);
//     }
// }

/**
 * @author Stephen Liu
 * @desc 使用axios第三方库访问后台服务器, 返回封装过后的Promise对象.
 * // axios的属性
 * @param {string} url 请求的接口地址, 格式: "/xxx...".
 * @param {string} baseURL 请求的协议和域名, 如: http://www.baidu.com
 * @param {string} method HTTP请求方式, 默认GET.
 * @param {object} params 请求时加在URL后面的参数, 如: ?a=xx&b=xx, object对象格式.
 * @param {object} data 请求的数据, object对象格式.
 * @param {number} timeout 配置请求超时时间, 为毫秒数, 默认从配置文件读取.
 * @param {function} cancelToken 取消请求的回调函数, 接收cancel参数, 当执行cancel()参数时请求被取消.
 * @param {function} onUploadProgress 上传文件过程中的回调函数, 接收progressEvent参数.
 * @param {function} onDownloadProgress 下载文件过程中的回调函数, 接收progressEvent参数.
 * @param {function} transformRequest 在发送请求前对请求数据进行预处理, 函数接收1个参数, 为请求的数据, 需要return处理后的数据.
 * @param {function} transformResponse 接受到响应后在resolve之前对响应数据进行预处理, 函数接受2个参数, 包括响应的数据和请求时的config对象, 需要return过滤后的数据.
 * // 扩展的属性
 * @param {boolean} cache 是否开启缓存, 开启后同样的请求(url相同, 参数相同), 第二次请求时会直接返回缓存数据, 不会请求后台数据, 默认false.
 * @param {string} contentType HTTP请求头的Content-Type, 如: 'application/x-www-form-urlencoded'
 * @param {string} beforeRequest 请求之前会调用的方法
 * @param {string} afterResponse 响应返回后调用的方法
 * @param {function} responseInterceptor 在resolve之前拦截resolve, 可根据返回的数据自定义Promise是resolve还是reject, 如success为false的情况.
 * @param {string} devBaseURL 调试模式默认请求的协议和域名.
 * @param {function} serverError 在服务端返回异常时调用.
 * @param {function} browserError 在浏览器抛出异常时调用.
 * @param {string} mockPrefix 配置请求mock服务器的前缀.
 * @param {string} proxyPrefix 配置请求代理服务器的前缀.
 * @param {boolean} isDev 是否为调试模式.
 * @param {boolean} isMock 是否为 mock 模式.
 * @return {object} - 返回一个promise的实例对象.
 */
function HiggsRequest(options) {
    var _options = Object.assign({}, globalConfig, options);

    var {
        url,
        baseURL,
        method,
        params,
        data,
        timeout,
        cancelToken,
        onUploadProgress, 
        onDownloadProgress,
        transformRequest,
        transformResponse,
        // 扩展的属性
        cache,
        contentType,
        beforeRequest,
        afterResponse,
        responseInterceptor,
        devBaseURL,
        serverError,
        browserError,
        mockPrefix,
        proxyPrefix,
        isDev,
        isMock
    } = _options;

    var withCredentials = false;

    if (isEmpty(url)) {
        return Promise.resolve();
    }

    // 预处理数据
    // if (transformRequest) {
    //     data = transformRequest.call(_options, data);
    // }

    // type 为 POST 的请求会将参数转化为 formData 传递
    if (method === HttpMethod.POST) {

        if (isNotEmpty(data)) {
            // 根据配置的 contentType 对数据进一步处理
            switch (contentType) {
                case ContentType.FORM_URLENCODED:
                    if (!isFormData(data)) {
                        data = qs.stringify(data, { allowDots: true });
                    }
                    break;
            }
        }
    }

    if (!/^\//.test(url)) {
        url = '/' + url;
    }

    if (!cache) {
        params = params || {};
        params.t = new Date().getTime();
    }

    if (isNotEmpty(baseURL)) {
        withCredentials = true;
    }

    if (isDev) {
        log({ url, baseURL, method, data }, 'Request');

        // 开发阶段都需要跨域
        if (isEmpty(baseURL)) {
            withCredentials = true;
        }

        // MOCK 模式
        if (isMock) {
            // 只 mock 同域下的接口请求
            if (isEmpty(baseURL)) {
                url = `/${ mockPrefix + url }`;
            }
        // 代理服务
        } else {
            if (isEmpty(baseURL)) {
                // 没有传递 domain时, 使用同域下的接口服务器
                baseURL = devBaseURL;
            }
            url = `/${proxyPrefix}/${ getSubdomain(baseURL) + url }`;
            // 开发环境所有接口都通过代理服务器拦截域名转发, 解决跨域问题
            baseURL = null;
        }
    }

    if (beforeRequest) {
        beforeRequest(_options);
    }
    // showLoading(type, triggerLoading);

    var promise = new Promise(function(resolve, reject) {

        // 请求的文件类型
        if (contentType === ContentType.URL) {
            try {
                url = url + '?' + qs.stringify(params, { allowDots: true });
                resolve(url);
            } catch (e) {
                reject(e);
            }
        } else {
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            
            if (method === HttpMethod.POST) {
                axios.defaults.headers.post['Content-Type'] = contentType;
            }

            // 调用 axios 库
            axios({
                method,
                baseURL,
                url,
                timeout,
                params,
                data,
                withCredentials,       // 跨域请求带认证信息，譬如 Cookie, SSL Certificates，HTTP Authentication
                onUploadProgress,
                onDownloadProgress,
                cancelToken,
                transformRequest,
                transformResponse
            }).then(function(response) {
                if (isDev) {
                    log(response.data, 'Response');
                }

                if (afterResponse) {
                    afterResponse(response?.config);
                }
                
                // 配置了响应拦截器, 自行处理 resolve 和 reject 状态.
                if (responseInterceptor) {
                    responseInterceptor.call(_options, response.data, resolve, reject);
                } else {
                    resolve(response.data);
                }
            }).catch(function(error) {
                if (afterResponse) {
                    afterResponse(response?.config);
                }                
                
                // 服务端返回的异常
                if (error.response) {
                    var errMsg = error.response;
                    if (serverError) {
                        serverError(errMsg);
                        // Emitter.emit(Event.SHOW_ALERT, { statusCode: serverError }); 
                    }
                    
                    if (isIE()) {
                        console.error(JSON.stringify(errMsg));
                    } else {
                        console.error(errMsg);
                    }
                    
                    reject(errMsg);
                // 浏览器抛出的异常, 比如请求超时, 不同浏览器可能有不同的行为.
                } else {
                    if (browserError) {
                        browserError(error);
                        /*
                        * HACK: 此处做延迟处理是为解决firefox上多请求的弹窗bug
                        */
                        // setTimeout(() => {
                        //     Emitter.emit(Event.SHOW_ALERT, { statusCode: browserError });
                        // }, 1000);
                    }
                    console.error(error);
                    reject(error);
                }
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

/**
 *
 * @desc 设置全局默认选项
 * @param {object} options 需要覆盖默认配置的参数
 */
HiggsRequest.setup = function(options) {
    Object.assign(globalConfig, options);
};

export default HiggsRequest;