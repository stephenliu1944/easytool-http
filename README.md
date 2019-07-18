# axios-enhanced
Enhance axios features, use it like axios but more convenient.

## Extension features
cache,   
contentType,  
beforeRequest,   
afterResponse,   
proxyPath,   
onError,  
prepare,  
helpers,  
...

## Install
```
npm install --save axios-enhanced
```

## Usage
### Example
```js
import http from 'axios-enhanced';
http({
    baseURL: 'http://api.xxx.com',
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
import http, { Method, ContentType } from 'axios-enhanced';
// need setup before invoke http()
http.settings({
    baseURL: 'http://api.xxx.com',
    method: Method.POST,                                        // default is 'GET'
    contentType: ContentType.APPLICATION_X_WWW_FORM_URLENCODED  // default is 'json'
    withCredentials: true,                                      // default is false
    cache: false,                                               // default is true
    proxyPath: __DEV__ && '/api',                               // default is false
    isDev: __DEV__
});
```

### Instance
```js
import http, { Method, ContentType } from 'axios-enhanced';
// instance inherit default options
var instance = http.instance({
    baseURL: 'http://api.xxx.com',
    method: Method.POST,
    contentType: ContentType.MULTIPART_FORM_DATA
});

instance({
    url: '/getUser'
});
// or
instance.prepare({
    url: '/getUser'
});
```

### Handle file stream
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/assets/images/cat.png',
    responseType: 'blob'
}).then((response) => {
    var url = window.URL.createObjectURL(response.data);
    window.open(url);
});
```

### Preprocess request data
Use for preproccess request options, return a object, it will not send request.
```js
import { prepare } from 'axios-enhanced';

var request = prepare({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    params: {
        id: 1
    }
});
// request: { url, method, headers, params, data }
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
// request.toString() = url + params(need to set paramsSerializer)
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
import { Upload } from 'antd';
import { prepare, Method } from 'axios-enhanced';

var request = prepare({
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

<Upload name="file" action={request.url} headers={request.headers} ></Upload>
```

### Use proxy path
proxyPath is true.
```js
import http from 'axios-enhanced';

var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: __DEV__          // __DEV__ is true
});
// will request '/users'
```

proxyPath is String.
```js
var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: __DEV__ && '/api'  
});
// will request '/api/users'
```

proxyPath is Function.
```js
var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: __DEV__ && (baseURL, options) => '/api'
});
// will request '/api/users'
```

Use internal Function 'proxyBaseURL' to proxy baseURL.
```js
import { helpers } from 'axios-enhanced';

var promise = http({
    baseURL: 'http://api.xxx.com',
    url: '/users',
    proxyPath: __DEV__ && helpers.proxy.proxyBaseURL
});
// will request '/http://api.xxx.com/users'
```

### Interceptors
request interceptor
```js
http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    requestInterceptor(config) {
        config.headers.TOKEN = 'xxxxxx';
        // same with axios
        return config;
    }
});
// or
http({
    baseURL: 'http://api.xxx.com',
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
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    requestInterceptor(response) {
        // same with axios
        return response;
    }
});
// or
http({
    baseURL: 'http://api.xxx.com',
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
    baseURL: 'http://api.xxx.com',
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
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
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
            case 403:   // maybe other http request, like get token
                setTimeout(() => {
                    // finish the request.
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
```js
import http, { Method, ContentType, helpers } from 'axios-enhanced';

http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    transformRequest: [function (data, headers, options) {     // extra argument 'options'
        // serialize data form URL encoded.
        if (headers['Content-Type'] === ContentType.APPLICATION_X_WWW_FORM_URLENCODED) {
            return helpers.qs.stringify(data, {             // e.g. https://www.npmjs.com/package/qs
                arrayFormat: 'brackets',
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
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    transformResponse: [function (data, headers, options) {     // extra arguments 'headers' and 'options'
        // same with axios
        return data;
    }]
});
```

### Serializer
Serialize parameters.
```js
import http, { prepare, Method, ContentType, helpers } from 'axios-enhanced';

http({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
    paramsSerializer(params) {
        return helpers.qs.stringify(params, {   // e.g. https://www.npmjs.com/package/qs
            arrayFormat: 'brackets',
            allowDots: true
        });
    }
});
// or
prepare({
    baseURL: 'http://api.xxx.com',
    url: '/getUser',
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

## API
```js
/**
 * @desc wrap and extension axios lib, suport all options with axios.
 * @param {axios.options...} axios options.
 * @param {boolean} cache enable cache, default true.
 * @param {function} cancel wrap CancelToken of axios, function receive a cancel args.
 * @param {function} paramsSerializer same with axios options. false to disable default handler.
 * @param {string} contentType HTTP request header Content-Type, default 'application/json'.
 * @param {function|array} requestInterceptor wrap axios's interceptors.request.use().
 * @param {function|array} responseInterceptor wrap axios's interceptors.response.use().
 * @param {function|array} transformRequest wrap axios's transformRequest.
 * @param {function|array} transformResponse wrap axios's transformResponse.
 * @param {function} beforeRequest asynchronize process request interceptor, it's receive 3 args: (resolve, reject, options).
 * @param {function} afterResponse asynchronize process response interceptor, it's receive 4 args: (resolve, reject, response, options).
 * @param {function} onError when catch error will occur.
 * @param {string | function} proxyPath proxy path, can be string or function, the function receive a options args and return a string.
 * @param {boolean} isDev dev mode print more log info.
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
 * @desc rewrite baseURL like 'http://api.xxx.com' to '/http://api.xxx.com' for proxy matching
 * @param {string} prefix default proxy path function, when baseURL is null, will use current browser location.
 */
proxyBaseURL(baseURL)
```

### helpers.qs
refer to https://www.npmjs.com/package/qs

### axios options
The following options are provided by the underlying axios library.
```js
// `timeout` specifies the number of milliseconds before the request times out.
// If the request takes longer than `timeout`, the request will be aborted.
timeout: 1000, // default is `0` (no timeout)

// `withCredentials` indicates whether or not cross-site Access-Control requests
// should be made using credentials
withCredentials: false, // default

// `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
// This will set an `Authorization` header, overwriting any existing
// `Authorization` custom headers you have set using `headers`.
// Please note that only HTTP Basic auth is configurable through this parameter.
// For Bearer tokens and such, use `Authorization` custom headers instead.
auth: {
    username: 'janedoe',
    password: 's00pers3cret'
},

// `responseType` indicates the type of data that the server will respond with
// options are: 'arraybuffer', 'document', 'json', 'text', 'stream'
//   browser only: 'blob'
responseType: 'json', // default

// `responseEncoding` indicates encoding to use for decoding responses
// Note: Ignored for `responseType` of 'stream' or client-side requests
responseEncoding: 'utf8', // default

// `xsrfCookieName` is the name of the cookie to use as a value for xsrf token
xsrfCookieName: 'XSRF-TOKEN', // default

// `xsrfHeaderName` is the name of the http header that carries the xsrf token value
xsrfHeaderName: 'X-XSRF-TOKEN', // default

// `onUploadProgress` allows handling of progress events for uploads
onUploadProgress: function (progressEvent) {
// Do whatever you want with the native progress event
},

// `onDownloadProgress` allows handling of progress events for downloads
onDownloadProgress: function (progressEvent) {
// Do whatever you want with the native progress event
},

// `maxContentLength` defines the max size of the http response content in bytes allowed
maxContentLength: 2000,

// `validateStatus` defines whether to resolve or reject the promise for a given
// HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
// or `undefined`), the promise will be resolved; otherwise, the promise will be
// rejected.
validateStatus: function (status) {
    return status >= 200 && status < 300; // default
}
```