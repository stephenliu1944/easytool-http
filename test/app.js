// 该类用于测试模块
import 'core-js';
import httpRequest, { prepare, helpers, ContentType } from '../src/index';

httpRequest.settings({
    baseURL: '//192.232.222.3333:8888/service',
    // contentType: 'application/json',
    // paramsSerializer(params) {
    //     console.log('------------paramsSerializer-------', helpers.qs.stringify({ a: 1 }, { 
    //         arrayFormat: 'brackets',
    //         allowDots: true
    //     }));

    //     return helpers.qs.stringify(null, { 
    //         arrayFormat: 'brackets',
    //         allowDots: true
    //     });
    // },
    beforeRequest(resolve, reject, options) {
        console.log('------beforeRequest------:', options);
        resolve(options);
    },
    requestInterceptor: [(config) => {
        console.log('------requestInterceptor------');
        config.headers['token'] = 1;
        config.params.token = 'aaaaaaaaaaaaaaaa';
        return config;
    }, () => {}],
    transformRequest(data, headers, options) {
        console.log('------transformRequest------', this, headers);
        
        return data;
    },
    transformResponse: [function(data, headers, options) {
        console.log('------transformResponse------', data);
        return { name: 'stephen' };
    }],
    responseInterceptor(response) {
        console.log('------responseInterceptor------', response);
        return response;
    },
    afterResponse(resolve, reject, response) {
        // throw Error('abc');
        reject(response);
    },
    validateStatus(status) {
        return status >= 200 && status < 600; // default
    },
    onError() {
        console.log('------onError------');
    }
});

var abort;
httpRequest({
    baseURL: 'http://localhost:3000',
    url: '/user/123',
    contentType: ContentType.APPLICATION_JSON,
    method: 'post',
    // proxyPath: true,
    // params: {
    //     ip: '210.75.225.254'
    // }, 
    params: {
        t1: 'a',
        t2: '大米',
        t3: {
            t4: 't4'
        },
        t5: [1, 2, 3]
    },
    data: [{
        d1: 'a',
        d2: 'aa/d.fe',
        d3: [1, 2, 3]
    }],
    log: {
        a: 1,
        b: 2,
        c: 3
    },    
    cancel(c) {
        console.log('------cancel------', c);
        abort = c;
    }
    // paramsSerializer: null
    // paramsSerializer: function(params) {
    //     return helpers.qs.stringify(params, { 
    //         arrayFormat: 'brackets',
    //         allowDots: true
    //     });
    // }
}).then((data) => {
    console.log('data: ', data);
}, (e) => {
    console.log('fail->>', e);
});

// setTimeout(() => abort());

/* var url = prepare({
    // baseURL: 'http://ip.taobao.com/service/',
    url: '/getIpInfo.php',
    method: 'post',
    contentType: ContentType.APPLICATION_X_WWW_FORM_URLENCODED,
    cache: true,
    params: {
        t1: 'a',
        t2: '大米',
        t3: {
            t4: 't4'
        },
        t5: [1, 2, 3]
    },
    data: {
        d1: 'a',
        d2: [1, 2, 3]
    },
    headers: {
        a: 1,
        b: 2
    }
});

console.log('url ', url.toURL()); */