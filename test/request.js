import http, { ContentType } from '../src/index';

export function testGetRequest() {
    http({
        baseURL: 'http://localhost:3000',
        url: '/user/123',
        contentType: ContentType.APPLICATION_JSON,
        params: {
            t1: 'a',
            t2: '大米',
            t3: {
                t4: 't4'
            },
            t5: [1, 2, 3]
        },
        cancel(c) {
            console.log('------cancel------', c);
        }
    }).then((data) => {
        console.log('data: ', data);
    }, (e) => {
        console.log('fail->>', e);
    });
}

export function testAbortRequest() {
    const CancelToken = http.CancelToken;
    const source = CancelToken.source();

    http({
        baseURL: 'http://localhost:3000',
        url: '/user/123',
        contentType: ContentType.APPLICATION_JSON,
        method: 'post',
        // proxyURL: true,
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
        data: [{
            d1: 'a',
            d2: 'aa/d.fe',
            d3: [1, 2, 3]
        }],
        cancelToken: source.token

        // cancel(c) {
        //     console.log('------cancel------', c);
        //     abort = c;
        // }
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
    setTimeout(() => {
        source.cancel('Operation canceled by the user.');
    });
}