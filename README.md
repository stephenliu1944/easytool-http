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
    params: {
        id: 1
    }
});
promise.then((data) => {

}, (error) => {

});

import { prepare } from '@beancommons/http';
// return a handled url 'http://beancommons.com/getUser?id=1'
var url = prepare({
    baseURL: 'http://beancommons.com',
    url: '/getUser',
    params: {
        id: 1
    }
});
window.open(url);
```

## Use Proxy
```js
import http, { proxyHost } from '@beancommons/http';
// will request current domain 'http://localhost/api/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: '/api',  // string
    enableProxy: true
});

// will request current domain 'http://localhost/api/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: (options) => '/api',  // function, options is args
    enableProxy: true
});

// will request current domain 'http://localhost/proxy/beancommons.com/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: proxyHost,
    enableProxy: true
});
// with none baseURL, // will request current domain 'http://localhost/api/beancommons.com/setUser'
var promise = http({
    url: '/setUser',
    proxyPath: (options) => proxyHost(options, {
        prefix: '/api',         // default is '/proxy'
        domain: 'http://beancommons.com'
    }),
    enableProxy: true
});
```

## Setup global options
```js
import { settings } from '@beancommons/http';
// need setup before invoke http()
settings({
    method: 'POST',                                      // default is 'GET'
    contentType: 'application/x-www-form-urlencoded',    // default is 'application/json'
    cache: true,                                         // default is false
    proxyPath: '/api',                                   // default is '/proxy'
    enableProxy: __DEV__,
    isDev: __DEV__
});
```

## API
```js
/**
 * @desc 使用axios第三方库访问后台服务器, 返回封装过后的Promise对象.
 * @param {axios.options...} 支持全系axios参数.
 * @param {boolean} cache 是否开启缓存, 开起后每次请求会在url后加一个时间搓, 默认false.
 * @param {function} cancel 封装了CancelToken
 * @param {string} contentType HTTP请求头的 Content-Type, 默认为'application/json'
 * @param {function} requestInterceptor 封装了axios的interceptors.request.use().
 * @param {function} responseInterceptor 封装了axios的interceptors.response.use().
 * @param {function} resolveInterceptor 在resolve之前拦截resolve, 可进一步根据返回数据决定是resolve还是reject.
 * @param {function} onError 在请求返回异常时调用.
 * @param {boolean} enableProxy 是否开启代理服务, will replace baseURL with proxyPath, default is false.
 * @param {string | function} proxyPath proxy path, can be string or function, the function receive a options args and return a string, default is "/proxy."
 * @param {boolean} isDev 是否为调试模式, 调试模式会打一些log.
 * @param {object} extension custom data field
 * @return {object} - 返回一个promise的实例对象.
 */
http(options)
/**
 * @desc rewrite baseURL like 'http://beancommons.com' to '/proxy/beancommons.com' for proxy path matching
 */
proxyHost(options, props)
/**
 * @desc set global options
 */
settings(options)
/**
 * @desc return a handle url
 */
prepare(options, qsOptions)
```
