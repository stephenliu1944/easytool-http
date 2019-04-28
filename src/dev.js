// 该类用于测试模块
import HttpRequest, { settings, proxyHost, prepare } from './index';

settings({
    // baseURL: 'http://ip.taobao.com/service',
    requestInterceptor: function(config) {
        console.log('requestInterceptor', config);
    },
    responseInterceptor: function(data) {
        console.log('responseInterceptor', data);
    },
    baseURL: 'http://ip-api.com',
    proxyPath: proxyHost
});

HttpRequest({
    baseURL: 'http://tpic.home.news.cn',
    url: 'xhCloudNewsPic/xhpic1501/M09/38/3E/wKhTlFiRoJmEOB3RAAAAAFK1grI124.jpg',
    // params: {
    // ip: '210.75.225.254'
    // },
    responseType: 'stream'
}).then((e) => {
    var reader = new FileReader();

    reader.onloadend = function() {
        console.log(reader.result);
    };
  
    reader.readAsBinaryString(e);
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

console.log('url ', url + '');