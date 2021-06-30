import { isBlank, isString } from './common';

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
export function addSlash(url, suffix) {
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
export function removeSlash(url, suffix) {
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

export function trimURL(url) {
    return isString(url) ? url.trim() : null;
}