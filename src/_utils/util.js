/**
 * @desc 封装了一些项目常用方法.
 */
export function log(data, title) {
    /* eslint-disable no-console */
    if (title) {
        console.log(title + ' start');
    }

    if (isIE()) {
        console.log(JSON.stringify(data));
    } else {
        console.log(data);
    }

    if (title) {
        console.log(title + ' end');
    }
    /* eslint-enable no-console */
}
// 获取二级域名, TODO: 改用正则判断.
export function getSubdomain(domain) {
    var subdomain;
    if (isNotBlank(domain)) {
        if (domain.indexOf('.') !== -1) {
            subdomain = domain.split('.')[0];
            if (subdomain.indexOf('//') !== -1) {
                subdomain = subdomain.split('//')[1];
            }
        }
    }
    return subdomain;
}