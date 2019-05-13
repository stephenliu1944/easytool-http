import { isBlank } from 'utils/common';

// 根据 prefix + baseURL 生成代理拦截的 url
export function proxyHost(options = {}, prefix = '/proxy') {
    var { baseURL } = options;

    if (isBlank(baseURL)) {
        return prefix;
    }

    // 将 Host 部分作为代理服务匹配的字符串
    // http://www.xxx.com/api to /proxy/www.xxx.com/api
    // var host = baseURL.replace(/(^http[s]?:\/\/)/, '')
    // .replace(/(\/)$/, '');
    var host = baseURL.replace(/^(http[s]?:)?\/\//, '')
        .replace(/(\/)$/, '');
        
    return `${prefix}/${host}`;
}