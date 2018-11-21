# HiggsRequest
通用 HTTP 请求模块, 依赖 axios 库并对其进行了一些扩展.

## 模块引入
切换到公司内网npm服务
```
npm i -S higgs-request
```

## 示例
```
import HiggsRequest from 'higgs-request';
var promise = HiggsRequest({
    method: xxx,
    url: 'xxx',
    params: xxx,
    data: xxx
});
promise.then((data) => {}, (error) =>{});
```
## 设置全局默认选项
```
// 需要在入口文件中最先配置.
HiggsRequest.setup({
    method: ...,
    cache: ....,
    isDev: ...,
    isMock: ...
});
```

## 参数配置
```
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
 * @param {boolean} isDev 是否为调试模式, 调试模式会在请求的url前加上/proxy.
 * @param {boolean} isMock 是否为 mock 模式.
 * @return {object} - 返回一个promise的实例对象.
```
