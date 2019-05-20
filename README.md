# @beancommons/http
Wrap and extension axios lib, suport all options with axios.

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
    method: Method.POST,                                        // default is 'GET'
    contentType: ContentType.APPLICATION_X_WWW_FORM_URLENCODED  // default is 'json'
    cache: true,                                                // default is false
    proxyPath: __DEV__ && '/api',                               // default is ''
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
    contentType: ContentType.MULTIPART_FORM_DATA
});

instance({
    url: '/getUser'
});
```

### Preprocess request data
```js
import { prepare } from '@beancommons/http';
// request: { url, method, headers, params, data }
var request = prepare({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    params: {
        id: 1
    }
});
```

Use for open or download file URL.
```js
var request = prepare({
    baseURL: 'http://file.xxx.com',
    url: '/file',
    params: {
        id: 1
    }
});
// request.toString() = url + params
window.open(request.toString());    // http://file.xxx.com/file?id=1
// or
<a href={request.toString()} target="_blank" >Download</a>
```

Use jQuery ajax lib.
```js
// or use jquery ajax
$.get({
    url: request.url,                            // url was already proxy
    type: request.method,
    data: request.params || request.data         // params was already serialized
    headers: request.headers
})
```

Use Antd Upload Component.
```js
import { prepare, Method } from  '@beancommons/http';
import { Upload } from 'antd';

function uploadFile(params) {
    return prepare({
        baseURL: 'http://file.xxx.com',
        url: '/api/file/upload',
        method: Method.POST,
        params
    });
}

function render(props) {
    const request = uploadFile(props);

    return (
        <Upload name="file" action={request.url} ></Upload>
    );
}
```

upload with header token.
```js
function uploadFile(params) {
    return prepare({
        baseURL: 'http://file.xxx.com',
        url: '/api/file/upload',
        method: Method.POST,
        contentType: null,              // disable default contentType, use antd's
        headers: {
            token: 'xxxx-xxxx-xxxx'
        },
        params
    });
}

function render(props) {
    const request = uploadFile(props);

    return (
        <Upload name="file" action={request.url} headers={request.headers} ></Upload>
    );
}
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

proxyPath with host
```js
import { helpers } from '@beancommons/http';

// with baseURL will request '/www.beancharts.com/setUser'
var promise = http({
    baseURL: 'http://www.beancharts.com',
    url: '/setUser',
    proxyPath: helpers.proxy.proxyHost()
});

// with none baseURL will request '/api/setUser'
var promise = http({
    url: '/setUser',
    proxyPath: helpers.proxy.proxyHost('/api')       // set default proxy path when none host
});

// use other xhr lib, will request '/www.beancharts.com/setUser'
$.ajax({
    url: helpers.proxy.proxyHost()('http://www.beancharts.com') + '/setUser',
    success() {}
});
// or, will request '/api/setUser'
$.ajax({
    url: helpers.proxy.proxyHost('/api')() + '/setUser',
    success() {}
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
        var { data, status } = response;
        switch (status) {
            case 200:   // continue to process.
                resolve(data);
            case 401:   // need log in
                reject(response);

                setTimeout(() => {
                    location.href = `http://www.beancharts.com/login?callback=${encodeURIComponent(location.href)}`;
                }, 0);
                break;
            case 403:   // maybe other http request
                setTimeout(() => {
                    // continue to process.
                    resolve(data);  
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

### Transform
transformRequest
serialize form URL encoded.
```js
import qs from 'qs';
import http, { Method, ContentType, helpers } from '@beancommons/http';

http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    transformRequest: [function (data, header) {
        if (header['Content-Type'] === ContentType.APPLICATION_X_WWW_FORM_URLENCODED
            && !helpers.util.isFormData(data)) {

            return qs.stringify(data, {     // e.g. https://www.npmjs.com/package/qs
                allowDots: true
            });
        }

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

### Serializer
Serialize params.
```js
import qs from 'qs';
import { Method, ContentType } from '@beancommons/http';

http({
    baseURL: 'http://www.beancharts.com',
    url: '/getUser',
    paramsSerializer(params) {
        return qs.stringify(params, {   // e.g. https://www.npmjs.com/package/qs
            allowDots: true
        });
    }
});
```

## API
```js
/**
 * @desc wrap and extension axios lib, suport all options with axios.
 * @param {axios.options...} axios options.
 * @param {boolean} cache enable cache, default false.
 * @param {function} cancel wrap CancelToken of axios, function receive a cancel args.
 * @param {function} paramsSerializer same with axios options.
 * @param {string} contentType HTTP request header Content-Type, default 'application/json'.
 * @param {function|array} requestInterceptor wrap axios's interceptors.request.use().
 * @param {function|array} responseInterceptor wrap axios's interceptors.response.use().
 * @param {function} beforeRequest asynchronize process request interceptor, it's receive 3 args: resolve, reject, options.
 * @param {function} afterResponse asynchronize process response interceptor, it's receive 4 args: resolve, reject, response, options.
 * @param {function} onError when catch error will occur.
 * @param {string | function} proxyPath proxy path, can be string or function, the function receive a options args and return a string.
 * @param {boolean} isDev dev mode print more log info.
 * @param {object} extension custom data field.
 * @return {object} - return a promise instance.
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

### helpers.proxy
```js
/**
 * @desc rewrite baseURL like 'http://www.beancharts.com' to '/www.beancharts.com' for proxy matching
 * @param {string} prefix default proxy path of rootPath, when baseURL is null, default is ''
 */
proxyHost(prefix)(baseURL)
```

### helpers.util
```js
export function isArray(obj)

export function isString(obj)

export function isDate(obj)

export function isObject(obj)

export function isNumber(obj)

export function isFunction(obj)

export function isFormData(obj)

export function isIE()

/**
 * @desc 判断参数是否为空, 包括null, undefined, [], '', {}
 * @param {object} obj 需判断的对象
 */
export function isEmpty(obj)

/**
 * @desc 判断参数是否不为空
 */
export function isNotEmpty(obj)

/**
 * @desc 判断参数是否为空字符串, 比isEmpty()多判断字符串中全是空格的情况, 如: '   '.
 * @param {string} str 需判断的字符串
 */
export function isBlank(str)

/**
 * @desc 判断参数是否不为空字符串
 */
export function isNotBlank(obj)

/**
 * @desc 函数节流
 * @url http://underscorejs.org/#throttle
 * @param {string} func 防抖函数
 * @param {string} wait 间隔时间
 * @param {string} options 可选项
 */
export function throttle(func, wait, options)
```