# @beancommons/http
General HTTP Request module, extension from axios. support all options with axios.

## Install
```
npm install --save @beancommons/http
```

## Usage
GET request
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
```
POST request
```js
import http from '@beancommons/http';

var promise = http({
    baseURL: 'http://beancommons.com',
    method: 'post',
    url: '/getUser',
    data: {
        name: 'stephen',
        age: 34
    }
});
```
Get prepare request object.
```js
import { prepare } from '@beancommons/http';
// return a object, include { url, method, headers, params, data }
var obj = prepare({
    baseURL: 'http://beancommons.com',
    url: '/getUser',
    params: {
        name: 'stephen',
        age: 34
    },
    proxyPath: '/api'
});

// (url + params) -> '/api/getUser?name=stephen&age=34'
window.open(obj.toString());    
// use jquery ajax
$.get({
    url: obj.url,       // url was already proxy, '/api/getUser'
    data: obj.params    // params was already serialized, name=stephen&age=34
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
    proxyPath: '/api',                                   // default is null
    isDev: __DEV__
});
```

## Use proxyPath
### Use with Webpack DevServer.proxy or http-proxy-middleware
proxyPath is string.
```js
import http from '@beancommons/http';
// will request '/api/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: '/api'      // string
});
```
proxyPath is function.
```js
// will request '/api/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: (options) => '/api'  // function, options is input args
});
```
webpack.config.js
```js
module.exports = {
    //...
    devServer: {
        proxy: {
            '/api': 'http://beancommons.com'
        }
    }
};
```

### Use proxyHost function.
```js
import { proxyHost } from '@beancommons/http';
// will request '/proxy/beancommons.com/setUser'
var promise = http({
    baseURL: 'http://beancommons.com',
    url: '/setUser',
    proxyPath: proxyHost
});
```
config proxyHost options
```js
// will request '/api/beancommons.com/setUser'
var promise = http({
    url: '/setUser',
    proxyPath: (options) => proxyHost(options, {
        prefix: '/api',                     // set proxyPath prefix, default is '/proxy'
        domain: 'http://beancommons.com'    // set default domain
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
 * @param {axios.options...} support all options with axios.
 * @param {boolean} cache enable cache, default to false.
 * @param {function} cancel wrap axios.CancelToken.
 * @param {string} contentType request ContentType with entity body in headers, default to 'application/json'
 * @param {function} dataSerializer same with paramsSerializer but just for serialize `data`.
 * @param {function} requestInterceptor wrap axios.interceptors.request.use().
 * @param {function} responseInterceptor wrap axios.interceptors.response.use().
 * @param {function} beforeRequest async function, do something before request, receive 3 args resolve, reject, options(input).
 * @param {function} afterResponse async function, do something after response, receive 4 args, resolve, reject, response, options(input).
 * @param {function} onError invoke on response error.
 * @param {string | function} proxyPath proxy url path, can be string or function, the function receive a options args and return a string, default is null.
 * @param {boolean} isDev dev mode print more log info.
 * @param {object} extension custom data field.
 * @return {object} - promise instance.
 */
http(options)
/**
 * @desc set global options
 */
settings(options)
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
proxyHost(options, props)
```
