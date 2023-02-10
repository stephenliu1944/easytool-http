import { defaults, getNormalizedOptions } from './defaults';
import { handleHeaders, handleCache, handleProxyURL } from './handler';
import { isEmpty, isBlank, isFunction } from 'utils/common';
import { addSlash, removeSlash } from 'utils/url';

export default function(options) {
    if (isEmpty(options)) {
        throw 'options is required.';
    }

    if (isBlank(options.url)) {
        throw 'url is required.';
    }

    options = Object.assign({}, defaults, options);
    var beforeRequest = options.beforeRequest;
    
    if (beforeRequest) {
        // httpRequest 是异步, 这里是同步.
        beforeRequest((opts) => {
            options = opts || options;
        }, (error) => {
            throw error;
        }, options);
    }
    var _opts = getNormalizedOptions(options);
    var { url = '', method, paramsSerializer } = _opts;
    var _url = url;
    
    // 处理 header
    _opts.headers = handleHeaders(_opts);

    // 处理代理路径
    var _baseURL = handleProxyURL(_opts) || '';
    
    // 处理缓存
    _opts.params = handleCache(_opts);
    
    // 处理 requestInterceptor
    if (_opts.requestInterceptor) {
        let requestInterceptor = Array.isArray(_opts.requestInterceptor) ? _opts.requestInterceptor[0] : _opts.requestInterceptor;
        
        if (isFunction(requestInterceptor)) {
            _opts = requestInterceptor(_opts) || _opts;
        }
    }

    // 处理 transformRequest(data, header)
    if (_opts.transformRequest) {
        _opts.transformRequest.forEach((transform) => {
            _opts.data = transform(_opts.data, _opts.headers);
        });
    }
    
    // 序列化 params
    if (paramsSerializer) {
        _opts.params = paramsSerializer(_opts.params);
    }

    // url包含host, 优先使用url地址, 与axios行为一致
    if (_url.startsWith('http') || _url.startsWith('//')) {
        _baseURL = '';
    } else {
        _baseURL = removeSlash(_baseURL, true);
        _url = addSlash(_url);
    }

    return {
        method,
        url: _baseURL + _url,
        headers: _opts.headers,
        params: _opts.params,
        data: _opts.data,
        toString() {
            var url = this.url;
            if (typeof this.params === 'string') {
                url += '?' + this.params;
            } else if (typeof this.params === 'object' && this.params.t) {
                url += '?t=' + this.params.t;
            }
            return url;
        },
        toURL() {
            return this.toString();
        }
    };
}