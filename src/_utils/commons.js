import { isBlank } from '@beancommons/utils';
// url增加起始或末尾斜杠"/"
function appendSlash(url, suffix) {
    if (isBlank(url)) {
        return '';
    }
    
    if (suffix && !/\/$/.test(url)) {
        url += '/';
    } else if (!/^\//.test(url)) {
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
    } else if (/^\//.test(url)) {
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