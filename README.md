# @beancommons/http
General HTTP Request module, extension from axios.

## Install
```
npm install --save @beancommons/http
```

## Usage
```js
import HttpRequest from '@beancommons/http';
var promise = HttpRequest({
    method: xxx,
    url: 'xxx',
    params: xxx,
    data: xxx
});
promise.then((data) => {

}, (error) => {

});
```

## Setup global options
```js
// need setup before request.
HttpRequest.defaults = {
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
import HttpRequest from '@beancommons/http';
import { proxyPath } from '@beancommons/proxy';
HttpRequest.defaults = {
    proxyPath: proxyPath,
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
import { configProxy } from '@beancommons/proxy';
import pkg from './package.json';
const { local, proxy } = pkg.devServer;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        ....
        proxy: configProxy(proxy)
    }
    ...
}
```

## API
```js
/**
 * @desc 使用axios第三方库访问后台服务器, 返回封装过后的Promise对象.
 * @param {axios.options...} fully support axios options.
 * @param {boolean} cache 是否开启缓存, 开起后每次请求会在url后加一个时间搓, default false.
 * @param {function} cancel 封装了CancelToken, function receive a cancel parameter.
 * @param {string} contentType HTTP请求头的 Content-Type, default 'application/json'
 * @param {function} requestInterceptor 封装了axios的interceptors.request.use().
 * @param {function} responseInterceptor 封装了axios的interceptors.response.use().
 * @param {function} resolveInterceptor interceptor default behavior before resolve, which may decide whether result's resolve or reject by response data.
 * @param {function} onError when response error occur.
 * @param {boolean} enableProxy 是否开启代理服务, 会将 baseURL 设置为null,并且在 url 上添加代理信息, 默认 false.
 * @param {string | function} proxyPath 代理的路径, 可以为方法返回一个string, 默认为"/proxy."
 * @param {boolean} isDev 是否为调试模式, which print some log.
 * @return {object} - 返回一个promise的实例对象.
 */
HttpRequest(options)
```
