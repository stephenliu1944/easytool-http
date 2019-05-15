# @beancommons/http
General HTTP Request module, extension from axios.

## Install
```
npm install --save @beancommons/http
```

## Usage
### Example
```js
import http from '@beancommons/http';
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    params: {
        id: 1
    }
}).then((data) => {

}, (error) => {

});
```

### Setup global options
```js
import http, { Method, ContentType } from '@beancommons/http';
// need setup before invoke http()
http.settings({
    baseURL: 'http://www.beancharts.com',
    method: Method.GET,                                 // default is 'GET'
    contentType: ContentType.APPLICATION_JSON           // default is 'json'
    cache: true,                                        // default is false
    proxyPath: __DEV__ && '/api',                       // default is '/proxy'
    isDev: __DEV__
});
```

### Instance
```js
import http, { Method, ContentType } from '@beancommons/http';
// default options with instance
var instance = http.instance({
    baseURL: 'http://www.beancharts.com',
    method: Method.POST,
    contentType: ContentType.APPLICATION_X_WWW_FORM_URLENCODED
});
instance({
    url: '/getUser'
});
```

### Preprocess request data
```js
import { prepare } from '@beancommons/http';
// return a preprocess object, include { url, method, headers, params, data }
var obj = prepare({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    params: {
        id: 1
    }
});

window.open(obj.toString());    // url + params
// or use jquery ajax
$.get({
    url: obj.url,       // url was already proxy
    data: obj.params    // params was already serialized
})
// or use antd with ajax form, upload...
```

### Use proxy
proxyPath with string
```js
import http from '@beancommons/http';
// will request '/api/setUser'
var promise = http({
    baseURL: 'http://www.beancharts.com',
    url: '/setUser',
    proxyPath: '/api',  // string
});
```
proxyPath with function
```js
// will request '/api/setUser'
var promise = http({
    baseURL: 'http://www.beancharts.com',
    url: '/setUser',
    proxyPath: (options) => '/api',  // function
});
```
proxyPath with helpers api
```js
import { helpers } from '@beancommons/http';
var promise = http({
    baseURL: 'http://www.beancharts.com',
    url: '/setUser',
    proxyPath: helpers.proxyHost()
});
// will request '/www.beancharts.com/setUser'

var promise = http({
    url: '/setUser',
    proxyPath: helpers.proxyHost('/api')       // set default prefix
});
// will request '/api/setUser'
```

### Transform
transformRequest
```js
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    transformRequest: [function (data, headers) {
        // same with axios
        return data;
    }]
});
```
transformResponse
```js
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    transformResponse: [function (data) {
        // same with axios
        return data;
    }]
});
```

### Interceptors
request interceptor
```js
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    requestInterceptor(config) {
        config.headers.TOKEN = 'xxxxxx';
        // same with axios
        return config;
    }
});
// or
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    requestInterceptor: [(config) => {
        // same with axios
        return config;
    }, (error) => {
        // same with axios
        return Promise.reject(error);
    }]
});
```
response interceptor
```js
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    requestInterceptor(response) {
        // same with axios
        return response;
    }
});
// or
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    requestInterceptor: [(response) => {
        // same with axios
        return response;
    }, (error) => {
        // same with axios
        return Promise.reject(error);
    }]
});
```

### Asynchronize Interceptors
beforeRequest
```js
http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    beforeRequest(resolve, reject, options) {
        // Do something before request is sent
        setTimeout(() => {
            resolve(options);                   // will continue to process.
            // or
            reject('some error message.');      // will abort http request.
        }, 2000)
    }
});
```
afterResponse
```js

http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    afterResponse(resolve, reject, response, options) {
        switch (response.code) {
            case 200:
                // continue to process.
                resolve(response.data);
            case 403:
                // maybe other http request
                setTimeout(() => {
                    // continue to process.
                    resolve(response.data);
                }, 2000);
                break;
            case 500:
                // throw a error.
                reject(response);
                break;
        }
    }
});
```

### Other
Method and ContentType
```js
import { Method, ContentType } from '@beancommons/http';

http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    method: Method.POST,
    contentType: ContentType.APPLICATION_X_WWW_FORM_URLENCODED
});
```

## API
```js
/**
 * @desc 使用axios第三方库访问后台服务器, 返回封装过后的Promise对象.
 * @param {axios.options...} suport all options with axios.
 * @param {boolean} cache 是否开启缓存, 开起后每次请求会在url后加一个时间搓, 默认false.
 * @param {function} cancel 封装了CancelToken
 * @param {string} contentType HTTP请求头的 Content-Type, 默认为'application/json'
 * @param {function} dataSerializer same with paramsSerializer but just for serialize `data`.
 * @param {function|array} requestInterceptor wrap axios's interceptors.request.use().
 * @param {function|array} responseInterceptor wrap axios's interceptors.response.use().
 * @param {function} beforeRequest asynchronize process request interceptor, it's receive 3 args: resolve, reject, options.
 * @param {function} afterResponse asynchronize process response interceptor, it's receive 4 args: resolve, reject, response, options.
 * @param {function} onError 在请求返回异常时调用.
 * @param {string | function} proxyPath proxy path, can be string or function, the function receive a options args and return a string, default is "/proxy."
 * @param {boolean} isDev dev mode print more log info.
 * @param {object} extension custom data field.
 * @return {object} - 返回一个promise的实例对象.
 */
http(options)

/**
 * @desc set global options
 */
http.settings(options)

/**
 * @desc create a new instance
 */
http.instance(options)

/**
 * @desc return a preproccess object, includes { method, url, headers, params, data } properties.
 * @param {object} options same with http(options).
 * @return {object} - return a preprocess options.
 */
prepare(options)

/**
 * @desc rewrite baseURL like 'http://www.beancharts.com' to '/www.beancharts.com' for proxy matching
 * @param {string} prefix default prefix path of proxy, when baseURL is null to use, default is ''
 */
helpers.proxyHost(prefix)

/**
 * @desc general http method
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
 * @desc general content type
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
 * ...
 */
ContentType
```
