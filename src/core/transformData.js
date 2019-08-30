import qs from 'qs';
import { ContentType } from 'enums/common';
import { isObject, isArrayBufferView, isURLSearchParams, normalizeHeaderName } from 'utils/common';

export function transformRequestDefault(data, headers) {
    var contentType = normalizeHeaderName(headers, 'Content-Type');

    if (contentType === ContentType.APPLICATION_X_WWW_FORM_URLENCODED) {
        if (isURLSearchParams(data)) {
            return data.toString();
        }
        
        if (isObject(data)) {
            return qs.stringify(data, {     
                allowDots: true
            });
        }
    }

    if (contentType === ContentType.APPLICATION_JSON) {
        if (isObject(data)) {
            return JSON.stringify(data);
        }
    }

    if (isArrayBufferView(data)) {
        return data.buffer;
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
    return function(data, headers = opts.headers) {     // transformResponse 没有headrs
        return transform(data, headers, opts);
    };
}