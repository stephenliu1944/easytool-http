import { defaults, getNormalizedOptions } from './defaults';
import { handleHeaders, handleCache, handleProxyPath, handleInterceptor } from './handler';
import { isEmpty, isBlank } from 'utils/common';
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
        // TODO: httpRequest是通过resolve(opts)接收的参数, 这里行为不一致
        options = beforeRequest((opts) => opts, (error) => {throw error;}, options) || options;
    }

    var _opts = getNormalizedOptions(options);
    var { url = '', method, paramsSerializer } = _opts;
    var _url = url;
    
    // 处理 header
    _opts.headers = handleHeaders(_opts);

    // 处理代理路径
    var _baseURL = handleProxyPath(_opts) || '';
    
    // 处理缓存
    _opts.params = handleCache(_opts);
    
    if (_opts.requestInterceptor) {
        let use = handleInterceptor(_opts.requestInterceptor);
        _opts = use.success && use.success(_opts) || _opts;
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