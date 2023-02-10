import http from '../src/index';

export function testRequestInterceptor() {
    http.interceptors.request.use(function(config) {
        console.log('------------testRequestInterceptor');
        return config;
    }, function(error) {
        return Promise.reject(error);
    });
}

export function testResponseInterceptor() {
    http.interceptors.response.use(function(response) {
        console.log('------------testResponseInterceptor');
        return response;
    }, function(error) {
        return Promise.reject(error);
    });
}