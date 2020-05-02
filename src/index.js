import { httpRequest } from './core/request';
import prepareRequest from './core/prepareRequest';
import * as helpers from './helpers';
import { Method, ContentType } from './enums/common';

var prepare = prepareRequest;

export {
    prepare,            // 兼容老版本, 即将废弃
    prepareRequest,
    Method,
    ContentType,
    helpers
};

export default httpRequest;

