# @beancommons/http
General HTTP Request module, extension from axios.

## Install
```
npm install --save @beancommons/http
```

## Usage
```js
import http from '@beancommons/http';
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/getUser',
    interceptor: {
        request: [],
        response: {
            success(){

            },
            error(){
                
            }
        }
    }
    params: {
        id: 1
    }
});
promise.then((data) => {

}, (error) => {

});

import { prepare } from '@beancommons/http';
// return a preprocess object, include { url, method, headers, params, data }
var obj = prepare({
    baseURL: 'http://beancommons.com',
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
```

## Setup global options
```js
import { settings } from '@beancommons/http';
// need setup before invoke http()
settings({
    method: 'POST',                                      // default is 'GET'
    contentType: 'application/x-www-form-urlencoded',    // default is 'application/json'
    cache: true,                                         // default is false
    proxyPath: __DEV__ && '/api',                         // default is '/proxy'
    isDev: __DEV__
});
```

## Use proxy
```js
import http from '@beancommons/http';
// will request current domain 'http://localhost/api/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: '/api',  // string
});

// will request current domain 'http://localhost/api/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: (options) => '/api',  // function, options is args
});
  
import { proxyHost } from '@beancommons/http';
// will request current domain 'http://localhost/proxy/beancommons.com/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: proxyHost
});
// with none baseURL, // will request current domain 'http://localhost/api/beancommons.com/setUser'
var promise = http({
    url: '/setUser',
    proxyPath: (options) => proxyHost(options, {
        prefix: '/api',         // default is '/proxy'
        domain: 'http://beancommons.com'
    })
});
```

## Advance
beforeRequest
```js
import http from '@beancommons/http';

function beforeRequest(resolve, reject, options) {
    setTimeout(() => {
        resolve(options);                   // will continue to process.
        // or
        reject('some error message.');      // will abort http request.
    }, 2000)
}

http({
    baseURL: 'http://beancommons.com',
    url: '/getUser',
    beforeRequest
}).then((data) => {

}, (error) => {
    console.log(error)      // when beforeRequest invoke reject, error will be 'some error message.'
});
```
afterResponse
```js
function afterResponse(resolve, reject, response, options) {
    switch (response.code) {
        case 403:
            // maybe other http request
            setTimeout(() => {
                resolve(response);
            }, 2000);
            break;
        case 500:
            reject(response.error);
            break;
        default:
            resolve(response);
    }
}

http({
    baseURL: 'http://beancommons.com',
    url: '/getUser',
    afterResponse
}).then((data) => {

}, (error) => {
    console.log(error);
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
 * @desc return a preproccess object, includes { method, url, headers, params, data } properties.
 * @param {object} options same with http(options).
 * @return {object} - return a preprocess options.
 */
prepare(options)
/**
 * @desc rewrite baseURL like 'http://beancommons.com' to '/proxy/beancommons.com' for proxy matching
 * @param {object} props receive a object, include { prefix, domain }.
 */
ProxyUtils.proxyHost(options)
```
