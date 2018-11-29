// 该类用于测试模块
import HttpRequest from './index';

HttpRequest.defaults = {
    requestInterceptor: function(config) {
        console.log('requestInterceptor', config);
    },
    responseInterceptor: function(data) {
        console.log('responseInterceptor', data);
    }
};

HttpRequest({
    url: '/service/getIpInfo.php',
    baseURL: 'http://ip.taobao.com',
    params: {
        ip: '210.75.225.254'
    },
    // enableProxy: true
}).then((e) => {
    console.log('success', e);
}, (e) => {
    console.log('fail', e);
});

HttpRequest({
    url: '/service/getIpInfo.php',
    baseURL: 'http://ip.taobao.com',
    params: {
        ip: '210.75.225.254'
    }
}).then((e) => {
    console.log('success', e);
}, (e) => {
    console.log('fail', e);
});