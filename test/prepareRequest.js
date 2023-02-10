import { prepareRequest, ContentType } from '../src/index';

export function testPrepareRequest() {
    var url = prepareRequest({
        baseURL: 'http://ip.taobao.com/service/',
        url: '/user/getIpInfo.php',
        proxyURL: true,
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
    
    console.log('url ', url.toURL());
}