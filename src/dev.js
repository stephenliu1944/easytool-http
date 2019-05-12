// 该类用于测试模块
import httpRequest, { prepare } from './index';
import axios from 'axios';

axios.get('/api/?results=50', {
    proxy: {
        host: 'http://www.baidu.com',
        port: 8888
    }
})
    .then(response => {
        const data = response.data.results;
        this.setState({ data });
    })
    .catch(error => {
        console.log(error);
    });

httpRequest.settings({
    // baseURL: 'http://ip.taobao.com/service',
    requestInterceptor: function(config) {
        console.log('requestInterceptor', config);
    },
    responseInterceptor: function(data) {
        console.log('responseInterceptor', data);
    },
    // baseURL: 'http://ip-api.com',
    // proxyPath: proxyHost
    proxy: {
        host: '127.0.0.1',
        port: 9000
    }
});

httpRequest({
    // baseURL: 'http://tpic.home.news.cn',
    url: 'xhCloudNewsPic/xhpic1501/M09/38/3E/wKhTlFiRoJmEOB3RAAAAAFK1grI124.jpg',
    // params: {
    // ip: '210.75.225.254'
    // },
    proxy: {
        host: '127.0.0.1',
        port: 8080
    }
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