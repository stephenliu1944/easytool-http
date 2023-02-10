# @easytool/http
Enhance axios features.

## Extension features
- cache
- contentType
- beforeRequest
- afterResponse
- proxyURL
- preventDuplicate
- onError
- prepareRequest
- abortAll
- helpers

## Install
```
npm install --save @easytool/http
```

## Usage
### Example
```js
import http from '@easytool/http';
http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    params: {
        id: 1
    }
}).then((data) => {

}, (error) => {

});
```

### defaults
defaults is used for setup global options.
```js
import http, { Method, ContentType } from '@easytool/http';
// need setup before invoke http()
http.defaults({
    baseURL: 'http://api.xxx.com',
    method: Method.POST,                                        // default is 'GET'
    contentType: ContentType.APPLICATION_X_WWW_FORM_URLENCODED  // default is 'json'
    withCredentials: true,                                      // default is false
    cache: false,                                               // default is true
    proxyURL: __DEV__ && '/api',                               // default is false
    isDev: __DEV__
});
```

### instance
instance method is used for set instance options and it will inherit global options.
```js
import http, { Method, ContentType } from '@easytool/http';

var instance = http.create({
    baseURL: 'http://api.xxx.com',
    method: Method.POST,
    contentType: ContentType.MULTIPART_FORM_DATA
});

instance({
    url: '/user/123'
});
// or
var request = instance.prepareRequest({
    url: '/user/123'
});
```

### prepareRequest
prepareRequest is used for preproccess request options, it will not send request but still execute below method:
beforeRequest() > proxyURL() > requestInterceptor() > transformRequest() > paramsSerializer(), and return a preproccess object:  
```js
{
    url,
    method,
    headers,
    params,
    data,
    toURL()
}
```
#### Example
```js
import { prepareRequest } from '@easytool/http';

var request = prepareRequest({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    params: {
        id: 1
    }
});
// request: { url, method, headers, params, data }
```

Use for open or download file URL.
```js
var request = prepareRequest({
    baseURL: 'http://file.xxx.com',
    url: '/file',
    params: {
        id: 1
    }
});
// request.toURL() = url + params(rewrite paramsSerializer option to change default serialize behavior)
window.open(request.toURL());    // http://file.xxx.com/file?id=1
// or
<a href={request.toURL()} target="_blank" >Download</a>
```

Use jQuery ajax lib.
```js
// or use jquery ajax
$.get({
    url: request.toURL(),      // url was already proxy
    type: request.method,
    data: request.data         // params was already serialized
    headers: request.headers
})
```

Use Antd Upload Component.
```js
import { Upload } from 'antd';
import { prepareRequest, Method } from '@easytool/http';

var request = prepareRequest({
    baseURL: 'http://file.xxx.com',
    url: '/api/file/upload',
    method: Method.POST,
    contentType: null,              // disable default contentType, use antd's
    headers: {
        token: 'xxxx-xxxx-xxxx',
        ...
    },
    params
});

<Upload name="file" action={request.toURL()} headers={request.headers} ></Upload>
```

### Handle file stream
```js
import http from '@easytool/http';

http({
    baseURL: 'http://api.xxx.com',
    url: '/assets/images/cat.png',
    responseType: 'blob'                // IE10+
}).then((response) => {
    var blob = response.data;
    // response.headers['content-disposition']; // get filename from Content-Disposition
    // IE10-Edge
    if ('msSaveOrOpenBlob' in window.navigator) {
        window.navigator.msSaveOrOpenBlob(blob, 'screenshot.png');
    } else {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'screenshot.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
```

### proxyURL
proxyURL will proxy the request to local server and add the config proxyURL to the top of url.

proxyURL is true.
```js
import http from '@easytool/http';

var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    proxyURL: true
});
// will request ' http://localhost/user/123'
```

proxyURL is String.
```js
import http from '@easytool/http';

var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    proxyURL: '/api'  
});
// will request 'http://localhost/api/user/123'
```

proxyURL is Function.
```js
import http from '@easytool/http';

var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    proxyURL: (baseURL, options) => '/proxy'
});
// will request 'http://localhost/proxy/user/123'
```

Use internal Function 'proxyBaseURL' to proxy baseURL.
```js
import http, { helpers } from '@easytool/http';

var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    proxyURL: helpers.proxy.proxyBaseURL
});
// will request 'http://localhost/http://api.xxx.com/user/123'
```

### Interceptors
#### defaultInterceptor
```js
import http from '@easytool/http';

http.defaults({
    requestInterceptor(config) {
        // Do something before request is sent
        config.headers.TOKEN = 'xxxxxx';
        return config;
    },
    responseInterceptor(response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    }
});
// or
http.defaults({
    requestInterceptor: [function(config) {
        // Do something before request is sent
        return config;
    }, function(error) {
        // Do something with request error
        return Promise.reject(error);
    }],
    responseInterceptor: [function(response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    }, function(error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    }]
});
```
#### customInterceptor
```js
import http from '@easytool/http';

// Add a request interceptor
http.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
http.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});
```

### Asynchronize Interceptors
#### beforeRequest
```js
import http from '@easytool/http';

http({
    url: '/user/123',
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
#### afterResponse
```js
import http from '@easytool/http';

http({
    url: '/user/123',
    afterResponse(resolve, reject, response, options) {
        var { data, status } = response;
        switch (status) {
            case 200:   // continue to process.
                resolve(data);
            case 401:   // need log in
                reject(response);

                setTimeout(() => {
                    location.href = `http://api.xxx.com/login?callback=${encodeURIComponent(location.href)}`;
                }, 0);
                break;
            case 500:   // throw a error.
                reject(response);
                break;
        }
    }
});
```

### Transform
#### transformRequest  
```js
import http, { Method, ContentType, helpers } from '@easytool/http';

http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    transformRequest(data, headers, options) {     // extra argument 'options'
        // serialize data form URL encoded.
        if (headers['Content-Type'] === ContentType.APPLICATION_X_WWW_FORM_URLENCODED) {
            // e.g. https://www.npmjs.com/package/qs
            return helpers.qs.stringify(data, {
                arrayFormat: 'brackets',
                allowDots: true
            });
        }

        return data;
    }
});
```

#### transformResponse
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    transformResponse: [function (data, headers, options) {     // extra arguments headers and options args
        // same with axios
        return data;
    }]
});
```

### paramsSerializer
Serialize parameters.
```js
import http, { prepareRequest, Method, ContentType, helpers } from '@easytool/http';

http({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    paramsSerializer(params) {
        return helpers.qs.stringify(params, {   // e.g. https://www.npmjs.com/package/qs
            arrayFormat: 'brackets',
            allowDots: true
        });
    }
});
// or
let request = prepareRequest({
    baseURL: 'http://api.xxx.com',
    url: '/user/123',
    paramsSerializer(params) {
        return helpers.qs.stringify(params, {   // e.g. https://www.npmjs.com/package/qs
            arrayFormat: 'brackets',
            allowDots: true
        });
    }
});
```

#### default paramsSerializer handler
Set to false or rewrite it could change default behavior.
```js
paramsSerializer(params) {
    return helpers.qs.stringify(params, {
        allowDots: true
    });
}
```

### Cancellation
#### abortAll
abort all request without create cancelToken.
```js
import http from '@easytool/http';
// first request
http({
    url: '/user/123',
});
// second request
http({
    url: '/user/321',
});

http.abortAll('Operation all canceled.');
```
#### CancelToken
```js
import http from '@easytool/http';

const CancelToken = http.CancelToken;
const source = CancelToken.source();

http({
    url: '/user/123',
    cancelToken: source.token
});

source.cancel('Operation canceled by the user.');
```

## API
Extension features
```js
/**
 * @desc wrap and extension axios lib, suport all options with axios.
 * @param {boolean} cache enable cache, default true.
 * @param {function} paramsSerializer same with axios options. false to disable default handler.
 * @param {string} contentType HTTP request header Content-Type, default 'application/json'.
 * @param {function|array} transformRequest wrap axios's transformRequest and extend arguments with (data, headers, options).
 * @param {function|array} transformResponse wrap axios's transformResponse and extend arguments with (data, headers, options).
 * @param {function} beforeRequest asynchronize process request interceptor, function receive (resolve, reject, options) args.
 * @param {function} afterResponse asynchronize process response interceptor, function receive (resolve, reject, response, options) args.
 * @param {function} onError when error was occur, it will be invoked before promise.catch(), function receive a error object which include (config, request, response, message, stack).
 * @param {string | function} proxyURL proxyURL will proxy the request to local server and add the config proxyURL to the top of url, it could be boolean, string or function, function receive (baseURL, options) args and return a string.
 * @param {boolean} preventDuplicate prevent duplicate request when the previous request is pendding(not work for FormData).
 * @param {boolean} isDev dev mode print more log info.
 * @other refer to https://github.com/axios/axios
 * @return {object} - return a promise instance.
 */
http(options)

/**
 * @desc set defaults options
 * ...
 * @param {function|array} requestInterceptor wrap axios.interceptors.request.use(success, error) method.
 * @param {function|array} responseInterceptor wrap axios.interceptors.response.use(success, error) method.
 */
http.defaults(options)

/**
 * @desc create a new instance
 */
http.create(options)

/**
 * @desc abort all request
 */
http.abortAll(message)

/**
 * @desc return a preproccess object, includes { method, url, headers, params, data } properties.
 * @param {object} options same with http(options).
 * @return {object} - return a preprocess options.
 */
prepareRequest(options)

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
 */
ContentType
```

### helpers.proxy
```js
/**
 * @desc rewrite baseURL like 'http://api.xxx.com' to '/http://api.xxx.com' for proxy matching
 * @param {string} baseURL when baseURL is null, will use location.host.
 * @return {string} proxyURL
 */
proxyBaseURL(baseURL)
```

### helpers.qs
refer to https://www.npmjs.com/package/qs