// 该类用于测试模块
import 'core-js';
import axios from 'axios';
import http from '../src/index';
import { testPrepareRequest } from './prepareRequest';
import { testGetRequest, testAbortRequest } from './request';
import { testRequestInterceptor, testResponseInterceptor } from './interceptor';

http.defaults({
    baseURL: '//192.232.222.3333:8888/service',
    // contentType: 'application/json',
    // paramsSerializer(params) {
    //     console.log('------------paramsSerializer-------', helpers.qs.stringify({ a: 1 }, { 
    //         arrayFormat: 'brackets',
    //         allowDots: true
    //     }));

    //     return helpers.qs.stringify(null, { 
    //         arrayFormat: 'brackets',
    //         allowDots: true
    //     });
    // },
    beforeRequest(resolve, reject, options) {
        console.log('------beforeRequest------:', options);
        options.a = 1111;
        resolve(options);
    },
    requestInterceptor: [(config) => {
        console.log('------requestInterceptor------');
        config.headers['token'] = 1;
        config.params.token = 'aaaaaaaaaaaaaaaa';
        return config;
    }],
    transformRequest(data, headers, options) {
        console.log('------transformRequest------', this, headers);
        
        return data;
    },
    transformResponse: [function(data, headers, options) {
        console.log('------transformResponse------', data);
        return { name: 'stephen' };
    }],
    responseInterceptor(response) {
        console.log('------responseInterceptor------', response);
        return response;
    },
    afterResponse(resolve, reject, response) {
        // throw Error('abc');
        resolve(response);
    },
    validateStatus(status) {
        return status >= 200 && status < 600; // default
    },
    onError() {
        console.log('------onError------');
    }
});

testRequestInterceptor();
testResponseInterceptor();

testGetRequest();
testGetRequest();
testGetRequest();

// httpRequest.abortAll();
// testAbortRequest();
// testAbortRequest();
// testAbortRequest();
// testAbortRequest();
// testAbortRequest();
// testAbortRequest();

// httpRequest.abortAll('Operation canceled All.');

testPrepareRequest();

// axios.get('/user/123', {
//     cancelToken: source.token
// });

// source.cancel('Operation canceled by the user.');