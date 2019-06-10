// 该类用于测试模块
import httpRequest, { prepare, helpers, ContentType } from './index';
import qs from 'qs';

httpRequest.settings({
    baseURL: '//192.232.222.3333:8888/service',
    // contentType: 'application/json',
    proxyPath: helpers.proxy.proxyHost('/api'),
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
    requestInterceptor(config) {
        console.log('------------requestInterceptor-------');
        config.headers['token'] = 1;
        config.params.token = 'aaaaaaaaaaaaaaaa';
        return config;
    },
    transformRequest: [function(data, headers) {
        console.log('------------transformRequest-------', this, headers);
        return data;
    }],
    responseInterceptor(response) {
        console.log('------------responseInterceptor-------', response);
        return response;
    },
    transformResponse: [function(data) {
        console.log('------------transformResponse-------', data);
        return { name: 'stephen' };
    }],
    afterResponse(resolve, reject, response) {
        // throw Error('abc');
        reject(response);
    },
    validateStatus(status) {
        return status >= 200 && status < 600; // default
    },
    onError() {
        console.log('-----onError-----');
    }
});

httpRequest({
    baseURL: 'http://tpic.home.news.cn',
    url: '/getIpInfo.php',
    contentType: ContentType.APPLICATION_JSON,
    method: 'post',
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
    data: {
        d1: 'a',
        d2: 'aa/d.fe',
        d3: [1, 2, 3]
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

var url = prepare({
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

console.log('url ', url.toString());