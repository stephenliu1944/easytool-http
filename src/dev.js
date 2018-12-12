// 该类用于测试模块
import HttpRequest, {
    proxyBaseURL
} from './index';

HttpRequest.defaults = {
    requestInterceptor: function(config) {
        console.log('requestInterceptor', config);
    },
    responseInterceptor: function(data) {
        console.log('responseInterceptor', data);
    },
    proxyPath: proxyBaseURL
};

HttpRequest({
    url: '/getIpInfo.php',
    baseURL: 'http://ip.taobao.com/service',
    params: {
        ip: '210.75.225.254'
    }
    // enableProxy: true
}).then((e) => {
    console.log('success', e);
}, (e) => {
    console.log('fail', e);
});

var url = HttpRequest({
    baseURL: 'http://ip.taobao.com/service/',
    url: '/getIpInfo.php',
    // params: {
    //     ip: '210.75.225.254'
    // },
    enableProxy: true,
    returnType: 'url'
});

console.log('url ', url);