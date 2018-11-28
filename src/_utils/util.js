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