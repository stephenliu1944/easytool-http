import { isObject, isString, isBlank } from 'utils/common';

// 根据 baseURL 生成代理拦截的 url
export function proxyHost(defaultPrefix) {

    return function(options) {  
        var baseURL;

        if (isString(options)) {
            baseURL = options;
        } else if (isObject(options)) {
            baseURL = options.baseURL;
        }

        // 如果为空直接返回代理路径前缀
        if (isBlank(baseURL)) {
            return defaultPrefix;
        }

        // 将 Host 部分作为代理服务匹配的字符串
        // http://www.xxx.com/api to /www.xxx.com/api
        // var host = baseURL.replace(/(^http[s]?:\/\/)/, '')
        // .replace(/(\/)$/, '');
        var host = baseURL.replace(/^(http[s]?:)?\/\//, '')
            .replace(/^\//, '')
            .replace(/\/$/, '');
            
        // return `${prefix}/${host}`;
        return `/${host}`;
    };
}