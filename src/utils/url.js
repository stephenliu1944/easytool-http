import { isBlank } from './common';

export function withHost(url) {
    // TODO: 处理 www.www.www/abc 的情况
    return !!url.match(/^(http[s]?:)?\/\//);
}

export function join(...args) {
    var paths = args.map((path) => {
        if (typeof path !== 'string' || path.trim().length === 0) {
            return '';
        }
        
        path = path.replace(/^\/+/g, '').replace(/\/+$/g, '');
         
        return path += '/';
    });

    return paths.reduce((pre, curr) => pre + curr);
}
// url增加起始或末尾斜杠"/"
function appendSlash(url, suffix) {
    if (isBlank(url)) {
        return '';
    }
    
    if (suffix && !/\/$/.test(url)) {
        url += '/';
    } else if (!suffix && !/^\//.test(url)) {
        url = '/' + url;
    }

    return url;
}

// url 移除起始或末尾斜杠"/"
function removeSlash(url, suffix) {
    if (isBlank(url)) {
        return '';
    }
    
    if (suffix && /\/$/.test(url)) {
        url = url.slice(0, -1);
    } else if (!suffix && /^\//.test(url)) {
        url = url.slice(1);
    }

    return url;
}

export function appendPrefixSlash(url) {
    return appendSlash(url);
}

export function appendSuffixSlash(url) {
    return appendSlash(url, true);
}

export function removePrefixSlash(url) {
    return removeSlash(url);
}

export function removeSuffixSlash(url) {
    return removeSlash(url, true);
}

export function adjustBaseURL(baseURL) {
    if (baseURL) {
        baseURL = baseURL.trim();
        baseURL = removeSuffixSlash(baseURL);
    // 解决 baseURL 为 0, false, ''的情况
    } else {
        baseURL = null;
    }
    
    return baseURL;
}

export function adjustURL(url) {
    if (url) {
        url = url.trim();
        url = appendPrefixSlash(url);
    }

    return url;
}