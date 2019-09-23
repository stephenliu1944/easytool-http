# @middlend/http
扩展了 axios 的功能, 简化了部分操作, 兼容 axios 语法.

## 扩展特性
- cache
- contentType
- beforeRequest
- afterResponse
- proxyPath
- onError
- prepare
- helpers

## 安装
```
npm install --save @middlend/http
```

## 使用
### 示例
```js
import http from '@middlend/http';
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    params: {
        id: 1
    }
}).then((data) => {

}, (error) => {

});
```

### settings
该方法用于配置全局的请求默认参数
```js
import http, { Method, ContentType } from '@middlend/http';
// 需要在调用 http 请求之前配置
http.settings({
    baseURL: 'http://api.xxx.com',
    method: Method.POST,                                        // 默认为 'GET'
    contentType: ContentType.APPLICATION_X_WWW_FORM_URLENCODED  // 默认为 'json'
    withCredentials: true,                                      // 默认为 false
    cache: false,                                               // 默认为 true
    proxyPath: __DEV__ && '/api',                               // 默认为 false
    isDev: __DEV__
});
```

### Instance
该方法用于配置实例请求的默认参数, 会继承全局配置
```js
import http, { Method, ContentType } from '@middlend/http';

var instance = http.instance({
    baseURL: 'http://api.xxx.com',
    method: Method.POST,
    contentType: ContentType.MULTIPART_FORM_DATA
});

instance({
    url: '/getUser'
});
// or
instance.prepare({
    url: '/getUser'
});
```

### prepare
该方法用于预处理请求参数, 不会真正发起 http 请求, 但同样会依次执行请求前的生命周期函数:  
beforeRequest() > proxyPath() > requestInterceptor() > transformRequest() > paramsSerializer(), 同时返回一个预处理对象, 包括以下属性:  
```js
{
    url,
    method,
    headers,        // 处理后的 headers 信息
    params,         // 被序列化后的参数
    data,           // 被处理后的数据
    toURL()         // 生成预处理后的 url
}
```
Demo
```js
import { prepare } from '@middlend/http';

var request = prepare({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    params: {
        id: 1
    }
});
// request: { url, method, headers, params, data }
```

使用 window.open()
```js
var request = prepare({
    baseURL: 'http://file.xxx.com',
    url: '/file',
    params: {
        id: 1
    }
});
// request.toURL() = url + params(配置 paramsSerializer 参数可覆盖默认序列化行为)
window.open(request.toURL());    // http://file.xxx.com/file?id=1
// or
<a href={request.toURL()} target="_blank" >Download</a>
```

使用 JQuery ajax 库.
```js
var request = prepare({
    baseURL: 'http://api.xxx.com',
    url: '/user',
    proxyPath: '/api',
    params: {
        id: 1
    }
});

$.ajax({
    url: request.toURL(),      // http://api.xxx.com/api/user?id=1  (配置了 proxyPath 也会一并处理)
    type: request.method,
    data: request.data
    headers: request.headers
})
```

使用 Antd 上传组件.
```js
import { Upload } from 'antd';
import { prepare, Method } from '@middlend/http';

var request = prepare({
    baseURL: 'http://file.xxx.com',
    url: '/api/file/upload',
    method: Method.POST,
    contentType: null,              // 取消默认参数配置, 使用 antd 的配置
    headers: {
        token: 'xxxx-xxxx-xxxx',
        ...
    },
    params
});

<Upload name="file" action={request.toURL()} headers={request.headers} ></Upload>
```

### 文件流下载
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/assets/images/cat.png',
    responseType: 'blob'                // IE10+
}).then((response) => {
    var blob = response.data;
    // response.headers['content-disposition']; // 从 Content-Disposition 响应头获取文件名信息
    // IE10-Edge
    if ('msSaveOrOpenBlob' in window.navigator) {
        window.navigator.msSaveOrOpenBlob(blob, 'screenshot.png');
    } else {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'screenshot.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
```

### proxyPath
配置该属性会将请求转发到本地服务, 并在请求的 url 前加上配置的代理路径, 方便代理服务根据请求的路径转发到指定的后端服务.  支持的参数类型: Boolean, String, Function.

proxyPath 是 true.
```js
var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: true
});
// 将请求 ' http://localhost/users'
```

proxyPath 是 String 类型.
```js
var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: '/api'  
});
// will request 'http://localhost/api/users'
```

proxyPath 是 Function 类型.
```js
var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: (baseURL, options) => '/proxy'
});
// will request 'http://localhost/proxy/users'
```

使用内部方法代理 baseURL 部分.
```js
import { helpers } from '@middlend/http';

var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: helpers.proxy.proxyBaseURL
});
// will request 'http://localhost/http://api.xxx.com/users'
```

### Interceptors
本库简化了使用拦截器的操作.  

request interceptor
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    requestInterceptor(config) {
        // Do something before request is sent
        config.headers.TOKEN = 'xxxxxx';
        return config;
    }
});
// or
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    requestInterceptor: [(config) => {
        // Do something before request is sent
        return config;
    }, (error) => {
        // Do something with request error
        return Promise.reject(error);
    }]
});
```

response interceptor
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    requestInterceptor(response) {
        // Do something with response data
        return response;
    }
});
// or
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    requestInterceptor: [(response) => {
        // Do something with response data
        return response;
    }, (error) => {
        // Do something with response error
        return Promise.reject(error);
    }]
});
```

### Asynchronize Interceptors
增加了2个异步拦截器, 用于异步操作后继续执行.  

beforeRequest
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    beforeRequest(resolve, reject, options) {
        // 在请求前的一些逻辑处理, 比如记录日志
        setTimeout(() => {
            resolve(options);                   // 调用 resolve() 后会继续处理.
            // or
            reject('some error message.');      // 调用 reject() 后会终止请求.
        }, 2000)
    }
});
```

afterResponse
```js

http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    afterResponse(resolve, reject, response, options) {
        var { data, status } = response;
        switch (status) {
            case 200:
                resolve(data);
            case 401:
                reject(response);

                setTimeout(() => {
                    location.href = `http://api.xxx.com/login?callback=${encodeURIComponent(location.href)}`;
                }, 0);
                break;
            case 500:
                reject(response);
                break;
        }
    }
});
```

### Transform
简化了 transform 方法, 并增加了传入的参数.  

transformRequest  
```js
import http, { Method, ContentType, helpers } from '@middlend/http';

http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    transformRequest(data, headers, options) {     // 增加了 options 参数
        // 序列化 data 数据
        if (headers['Content-Type'] === ContentType.APPLICATION_X_WWW_FORM_URLENCODED) {
            // e.g. https://www.npmjs.com/package/qs
            return helpers.qs.stringify(data, {
                arrayFormat: 'brackets',
                allowDots: true
            });
        }

        return data;
    }
});
```

transformResponse
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    transformResponse(data, headers, options) {     // 增加了 headers 和 options 参数
        // same with axios
        return data;
    }
});
```

### paramsSerializer
序列化请求参数.  
helpers 对象内置了 qs 模块便于序列化处理.
```js
import http, { prepare, Method, ContentType, helpers } from '@middlend/http';

http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    paramsSerializer(params) {
        return helpers.qs.stringify(params, {   // e.g. https://www.npmjs.com/package/qs
            arrayFormat: 'brackets',
            allowDots: true
        });
    }
});
// or
prepare({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    paramsSerializer(params) {
        return helpers.qs.stringify(params, {   // e.g. https://www.npmjs.com/package/qs
            arrayFormat: 'brackets',
            allowDots: true
        });
    }
});
```

#### 默认的 paramsSerializer 处理
将该选项设置为 false 或重写它可改变默认行为.
```js
paramsSerializer(params) {
    return helpers.qs.stringify(params, {
        allowDots: true
    });
}
```

### cancel
简化了 cancel 操作
```js
var abort;

http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    cancel(c) {
        abort = c;
    }
});

setTimeout(() => abort());
```

## API
扩展特性
```js
/**
 * @desc 扩展, 简化 axios 的参数信息.
 * @param {boolean} cache 是否启用浏览器缓存, 默认 true.
 * @param {function} cancel 封装了 CancelToken 对象, 该方法接收一个 cancel 方法参数, 执行该方法则终止请求.
 * @param {function} paramsSerializer 序列化请求参数(与 axios一致). 设置为 false 取消默认序列化行为.
 * @param {string} contentType 请求头的 Content-Type 信息, 默认为 'application/json'.
 * @param {function|array} transformRequest 封装了 axios 的 transformRequest 方法, 扩展了接收参数(data, headers, options).
 * @param {function|array} transformResponse 封装了 axios 的 transformResponse 方法, 扩展了接收参数(data, headers, options).
 * @param {function|array} requestInterceptor 封装了 axios.interceptors.request.use(success, error) 方法.
 * @param {function|array} responseInterceptor 封装了 axios.interceptors.response.use(success, error) 方法.
 * @param {function} beforeRequest 异步请求拦截器, 方法接收三个参数 (resolve, reject, options), 执行 resolve() 方法继续处理, 执行 reject() 方法终止请求, options 为请求参数.
 * @param {function} afterResponse 异步响应拦截器, 方法接收四个参数 (resolve, reject, response, options), 执行 resolve() 方法响应成功, 执行 reject() 方法响应失败, response 为响应数据, options 为请求参数.
 * @param {function} onError 当请求出错时会调用该方法, 该方法在 promise.catch() 之前执行, 方法接收一个 error 对象, 对象包含 (config, request, response, message, stack) 属性.
 * @param {string | function} proxyPath 配置该属性会将请求转发到本地服务, 并在请求的 url 前加上配置的代理路径, 方便代理服务根据请求的路径转发到指定的后端服务.  支持的参数类型: Boolean, String, Function, 为方法时接收 (baseURL, options) 两个参数, 并且需要返回一个字符串作为代理路径.
 * @param {boolean} isDev 开发模式会打印请求和响应的日志信息.
 * @other 参考 https://github.com/axios/axios
 * @return {object} - 返回一个 promise 实例对象.
 */
http(options)

/**
 * @desc 配置全局默认选项
 */
http.settings(options)

/**
 * @desc 创建一个请求实例对象
 */
http.instance(options)

/**
 * @desc 该方法用于预处理请求参数, 不会真正发起 http 请求.
 * @param {object} options 与 http(options) 相同.
 * @return {object} - 返回一个预请求对象, 包含 { method, url, headers, params, data } 属性.
 */
prepare(options)

/**
 * @desc 通用的 HTTP 请求方法
 * @props
 * HEAD: 'head',
 * GET: 'get',
 * POST: 'post',
 * PUT: 'put',
 * PATCH: 'patch',
 * DELETE: 'delete',
 * OPTIONS: 'options',
 * TRACE: 'trace'
 */
Method

/**
 * @desc 通用的 content-type 信息
 * @props
 * MULTIPART_FORM_DATA: 'multipart/form-data',
 * APPLICATION_JSON: 'application/json',
 * APPLICATION_X_WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded',
 * APPLICATION_X_JAVASCRIPT: 'application/x-javascript',
 * APPLICATION_PDF: 'application/pdf',
 * TEXT_PLAIN: 'text/plain',
 * TEXT_HTML: 'text/html',
 * TEXT_XML: 'text/xml',
 * IMAGE_JPEG: 'image/jpeg',
 * IMAGE_GIF: 'image/gif',
 * IMAGE_PNG: 'image/png'
 */
ContentType
```

### helpers.proxy
```js
/**
 * @desc 帮助方法, 用于代理 baseURL 部分. 会重写 baseURL, 如 'http://api.xxx.com' to '/http://api.xxx.com'
 * @param {string} baseURL 当 baseURL 为空时, 会使用 location.host.
 * @return {string} proxyPath
 */
proxyBaseURL(baseURL)
```

### helpers.qs
参考 https://www.npmjs.com/package/qs