interface Proxy {
    proxyBaseURL(url: string): string;
}

export let helpers: {
    proxy: Proxy;
    qs: any;
}

export const Method: {
    HEAD: 'head';
    GET: 'get';
    POST: 'post';
    PUT: 'put';
    PATCH: 'patch';
    DELETE: 'delete';
    OPTIONS: 'options';
    TRACE: 'trace';
};

export const ContentType: {
    MULTIPART_FORM_DATA: 'multipart/form-data';
    APPLICATION_JSON: 'application/json';
    APPLICATION_X_WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded';
    APPLICATION_X_JAVASCRIPT: 'application/x-javascript';
    APPLICATION_PDF: 'application/pdf';
    TEXT_PLAIN: 'text/plain';
    TEXT_HTML: 'text/html';
    TEXT_XML: 'text/xml';
    IMAGE_JPEG: 'image/jpeg';
    IMAGE_GIF: 'image/gif';
    IMAGE_PNG: 'image/png';
}};

export function prepare(options: object): object;

export default {
    settings(options: object): void;
    instance(options: object): void;
    (options: object): Promise<any>;
};