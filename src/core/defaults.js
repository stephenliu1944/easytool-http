import qs from 'qs';
import { transformRequestDefault, transformResponseDefault, transformWrapper } from './transformData';
import { Method, ContentType } from 'enums/common';
import { adjustBaseURL, adjustURL } from 'utils/url';
import { isArray, isObject } from 'utils/common';

// global settings
export var defaults = {
    cache: true,
    // axios的默认参数
    method: Method.GET,
    responseType: 'json',
    // 扩展的属性默认值
    contentType: ContentType.APPLICATION_JSON,
    paramsSerializer(params) {
        if (isObject(params)) {
            return qs.stringify(params, {            
                allowDots: true
            });
        }
        return params;
    },
    // proxyPath: '/proxy',
    isDev: false
};

export function initOptions(opts) {
    if (!opts) {
        return;
    }

    var { baseURL, url, method = Method.GET, contentType, transformRequest = [], transformResponse = [] } = opts;

    method = method.toLowerCase();
    transformRequest = isArray(transformRequest) ? transformRequest : [transformRequest];
    transformResponse = isArray(transformResponse) ? transformResponse : [transformResponse];

    return Object.assign({}, opts, {
        baseURL: adjustBaseURL(baseURL),
        url: adjustURL(url),
        method: method,
        contentType: contentType?.toLowerCase(),
        transformRequest: method !== Method.GET && [...transformRequest, transformRequestDefault].map((fn) => transformWrapper(fn, opts)),
        transformResponse: [transformResponseDefault, ...transformResponse].map((fn) => transformWrapper(fn, opts))
    });
}