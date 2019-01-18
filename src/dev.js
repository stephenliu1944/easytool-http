// 该类用于测试模块
import HttpRequest, { settings, proxyHost, prepare } from './index';

settings({
    baseURL: 'http://ip.taobao.com/service',
    requestInterceptor: function(config) {
        console.log('requestInterceptor', config);
    },
    responseInterceptor: function(data) {
        console.log('responseInterceptor', data);
    },
    proxyURL: proxyHost
});

HttpRequest({
    url: '/getIpInfo.php',
    params: {
        ip: '210.75.225.254'
    },
    // enableProxy: true
}).then((e) => {
    console.log('success->>', e);
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
    enableProxy: true
});

console.log('url ', url);