var path = require('path');
var app = require('express')();
var settings = require('./settings');
var { formatObjectKey, searchMatchingData } = require('./utils');
var pkg = require('../package.json');
var { mock } = pkg.devEnvironments.servers;

app.use(function(req, res, next) {
    var mockDataPath = path.join(__dirname, settings.dataPath);
    // 从 mock data 数据源中找到匹配的数据
    var mockData = searchMatchingData(req.path, req.method, mockDataPath, settings.sort);

    if (mockData) {
        // 单条 mock data 的数据配置项
        var { delay = 0, status = 200, headers = {}, body } = mockData.response || {};

        setTimeout(function() {
            if (headers) {
                let resHeaders = Object.assign({}, formatObjectKey(settings.response.headers), formatObjectKey(headers));
                res.set(resHeaders);
            }
            res.status(status);

            // body 类型为 string 并且以 .xxx 结尾( 1 <= x <= 5), 代表是文件路径.
            if (/\.\w{1,5}$/.test(body)) {
                // 发送文件
                res.sendFile(body, {
                    root: path.join(__dirname, settings.resourcesPath)
                }, function(err) {
                    err && next(err);
                });
            } else {
                res.send(body);
            }
        }, delay);
    } else {
        next();
    }
});

app.use(function(err, req, res, next) {
    console.log(req.url, 404);
    res.status(404);
    res.send(err.message);
});

var server = app.listen(mock, function() {
    console.info('Mock Server listening on port ' + mock);
});

