import qs from 'qs';
import isBuffer from 'is-buffer';
import { isFormData, isArrayBuffer, isStream, isFile, isBlob, setContentTypeIfUnset, isObject, isArray, isArrayBufferView, isURLSearchParams, normalizeHeaderName } from 'utils/common';

export function transformRequestDefault(data, headers) {
    let contentType = normalizeHeaderName(headers, 'Content-Type');

    if (isFormData(data) ||
      isArrayBuffer(data) ||
      isBuffer(data) ||
      isStream(data) ||
      isFile(data) ||
      isBlob(data)
    ) {
        return data;
    }

    if (isArrayBufferView(data)) {
        return data.buffer;
    }

    if (isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
    }
    // 这行是我加的, 其他都是axios默认的, TODO: 移除
    if (isObject(data) && contentType === 'application/x-www-form-urlencoded') {
        return qs.stringify(data, {
            allowDots: true
        });
    }

    if (isObject(data) || isArray(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
    }

    return data;
}

export function transformResponseDefault(data) {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            /* Ignore */ 
        }
    }
    
    return data;
}

export function transformWrapper(transform, opts) {
    return function(data, headers = opts.headers) {     // transformResponse 没有 headers
        return transform(data, headers, opts);
    };
}