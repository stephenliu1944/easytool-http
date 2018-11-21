// 该类用于测试模块
import HttpRequest from './index';

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