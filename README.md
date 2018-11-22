# @beanutils/http-request
通用 HTTP 请求模块, 依赖 axios 库并对其进行了一些扩展.

## 模块引入
```
npm install --save @beanutils/http-request
```

## 示例
```
import HttpRequest from '@beanutils/http-request';
var promise = HttpRequest({
    method: xxx,
    url: 'xxx',
    params: xxx,
    data: xxx
});
promise.then((data) => {}, (error) =>{});
```

## 设置全局默认选项
```
// 需要在请求调用前设置.
HttpRequest.defaults = {
    method: 'GET',
    contentType: 'application/json',
    cache: true,
    isDev: true
});
```

## 参数配置
```
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
```
