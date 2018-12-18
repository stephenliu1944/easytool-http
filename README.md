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
    method: xxx,
    url: 'xxx',
    params: xxx,
    data: xxx
});
promise.then((data) => {

}, (error) => {

});

// return a proxy url
var url = http({
    baseURL: 'http://ip.taobao.com/service',
    url: 'xxx',
    params: xxx,
    returnType: 'url',
    enableProxy: true
});
```

## Setup global options
```js
// need setup before request.
http.defaults = {
    method: 'POST',
    contentType: 'application/json',    // default
    cache: true,
    proxyPath: '/proxy',                // default
    enableProxy: true,
    isDev: true
};
```

## Use Proxy
@beancommons/proxy is Easy to config webpack devServer proxy or http-proxy-middleware options.
```
npm install --save @beancommons/proxy
```
app.js
```js
import http, { proxyBaseURL } from '@beancommons/http';
http.defaults = {
    proxyPath: proxyBaseURL,
    enableProxy: true,
    ...
};
```
package.json  
It support three data types: string, array or object.
```js
"dependencies": {
...
},
"devDependencies": {
...
},
// custom field, whatever you want
"devServer": {          
    "local": 8080,
    // proxy http://api1.xxxx.com to http://api1.xxxx.com
    "proxy": "http://api1.xxxx.com"                           
     or
    "proxy": [
        // proxy http://api1.xxxx.com to http://api1.xxxx.com
        "http://api1.xxxx.com",                               
        // proxy http://api2.xxxx.com to http://localhost:3002
        { 
            "http://api2.xxxx.com": "http://localhost:3002"   
        },
        // proxy http://api3.xxxx.com to http://localhost:3003 and more custom options
        { 
            "http://api3.xxx.com": {                          
                target: "http://localhost:3003"
                (http-proxy-middleware options)...
            }
        }
    ]
     or
    "proxy": {
        "http://api1.xxx.com": "http://localhost:3001",       
        "http://api2.xxx.com": {                              
            target: "http://localhost:3002"
            (http-proxy-middleware options)...
        }
    }
}
...
```
webpack.config.dev.js
```js
import { proxy } from '@beancommons/proxy';
import pkg from './package.json';

const { local, proxy: proxyOpts } = pkg.devServer;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        ....
        proxy: {
            ...proxy(proxyOpts)
        }
    }
    ...
}
```

## API
```js
/**
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
 * @param {boolean} enableProxy 是否开启代理服务, will replace baseURL with proxyPath, default is false.
 * @param {string | function} proxyPath proxy path, can be string or function, the function receive a options args and return a string, default is "/proxy."
 * @param {boolean} isDev 是否为调试模式, 调试模式会打一些log.
 * @param {object} extension custom data field
 * @return {object} - 返回一个promise的实例对象.
 */
http(options)
```
