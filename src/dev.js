// 该类用于测试模块
import httpRequest, { prepare, helpers } from './index';

httpRequest.settings({
    baseURL: '//192.232.222.3333:8888/service',
    // baseURL: 'http://ip-api.com',
    proxyPath: helpers.proxyHost('/api'),
    requestInterceptor(config) {
        config.headers['abc'] = 1;
        return config;
    }
});

httpRequest({
    // baseURL: 'http://tpic.home.news.cn',
    url: '/getIpInfo.php',
    params: {
        ip: '210.75.225.254'
    }, 
    data: {
        name: 1,
        age: 2
    }
}).then((data) => {
    console.log('data: ', data);
}, (e) => {
    console.log('fail->>', e);
});

var url = prepare({
    // baseURL: 'http://ip.taobao.com/service/',
    url: '/getIpInfo.php',
    params: {
        t1: 'a',
        t2: 'aa/d.fe'
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

console.log('url ', url);