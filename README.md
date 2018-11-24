# @beanutils/http-request
General HTTP Request module, extension from axios.

## Install
```
npm install --save @beanutils/http-request
```

## Usage
```
import HttpRequest from '@beanutils/http-request';
var promise = HttpRequest({
    method: xxx,
    url: 'xxx',
    params: xxx,
    data: xxx
});
promise.then((data) => {}, (error) => {});
```

## Setup global options
```
// need setup before request.
// 需要在http请求前设置.
HttpRequest.defaults = {
    method: 'GET',
    contentType: 'application/json',
    cache: true,
    proxyPath: '/proxy',
    enableProxy: true,
    isDev: true
});
```
## Use Proxy
index.js
```
import HttpRequest, { dynamicPath } from '@beanutils/http-request';
HttpRequest.defaults = {
    proxyPath: dynamicPath,
    ...
};
```
webpack.config.dev.js
```
import { createDynamicProxy } from '@beanutils/http-request';
{
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        ....
        proxy: createDynamicProxy([
            'http://localhost:3001',     // mock
            'http://api1.xxxx.net',      // api
            'http://api2.xxx.net',       // api2
            'http://api3.xxx.net',       // api3
            ...
        ])
    }
    ...
}
```


## Options
```
 * @desc 使用axios第三方库访问后台服务器, 返回封装过后的Promise对象.
 * @param {axios.options...} 支持全系axios参数.
 * @param {boolean} cache 是否开启缓存, 开起后每次请求会在url后加一个时间搓, 默认false.
 * @param {function} cancel 封装了CancelToken
 * @param {string} contentType HTTP请求头的 Content-Type, 默认为'application/json'
 * @param {function} requestInterceptor 封装了axios的interceptors.request.use().
 * @param {function} responseInterceptor 封装了axios的interceptors.response.use().
 * @param {function} resolveInterceptor 在resolve之前拦截resolve, 可进一步根据返回数据决定是resolve还是reject.
 * @param {function} onError 在请求发生异常时调用, 可以用于统一错误处理.
 * @param {boolean} enableProxy 是否开启代理服务, 会将 baseURL 设置为null,并且在 url 上添加代理信息, 默认 false.
 * @param {string | function} proxyPath 代理的路径, 可以为方法返回一个string, 默认为"/proxy."
 * @param {boolean} isDev 是否为调试模式, 调试模式会打一些log.
 * @return {object} - 返回一个promise的实例对象.
```
