import http, { prepare, helpers } from '../src/index';

describe('ReturnType is promise', function() {
    it('xxx', function() {
        var url = prepare({
            // baseURL: 'http://ip.taobao.com/service/',
            url: '/getIpInfo.php',
            params: {
                ip: '210.75.225.254大米',
                path: '/dfdfdf/wefwef.pdf',
                t: 1234343434
            },
            enableProxy: true
        });
        console.log('url  ', url);
    });
});

describe('ReturnType is url', function() {
    it('xxx', function() {});
});