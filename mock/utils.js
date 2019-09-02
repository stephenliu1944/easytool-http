var fs = require('fs');
var path = require('path');

// 'content-type' to 'Content-Type'
function toBigCamel(str = '') {
    return str.replace(/([A-Za-z0-9])+-?/g, (match, p1, offset) => {        
        return match.slice(0, 1).toUpperCase() + match.slice(1).toLowerCase();
    });
}

function formatObjectKey(obj = {}) {
    var newObj = {};
    for (let key in obj) {
        newObj[toBigCamel(key)] = obj[key];
    }

    return newObj;
}
// 将路径语法转为正则表达式, 支持以下语法:
// :id, 匹配任意数字, 英文, 下划线, 中横线, 句号, 如: '/user/:name', matches /user/michael and /user/ryan
// *,   匹配任意数字, 英文, 下划线, 中横线, 如: '/files/*.*', matches /files/hello.jpg and /files/hello.html
// **,  匹配任意数字, 英文, 下划线, 中横线, 句号, 斜杠, 如: '/**/*.jpg', matches /files/hello.jpg and /files/path/to/file.jpg
function convertPathSyntaxToReg(pathSyntax) {
    var reg = pathSyntax.replace(/\//g, '\\/')  // / 替换为 \/ 
        .replace(/\./g, '\\.')                  // . 替换为 \. 
        .replace(/\*{2,}/g, '[\\w-\.\/]\+')     // 1个以上的 * 替换为 "\w-\.\/", 可跨层级.           
        .replace(/\*/g, '[\\w-]\+')             // 1个 * 替换为 "\w-", 不可跨层级.      
        .replace(/:[\w-\.]+/g, '[\\w-\.]\+');   // : 开头的字符串替换为 "\w-\.", 不可跨层级.      
    
    return eval('/^' + reg + '$/');             // 字符串转化为正则表达式
}

function isMatchingData(reqURL, reqMethod, item = {}) {
    var { url, method } = Object.assign({}, item, item.request);

    if (method && method.toLowerCase() !== reqMethod.toLowerCase()) {
        return false;
    }

    // 移除开头和末尾的 "/"
    reqURL = reqURL.replace(/^\//, '')
        .replace(/\/$/, '');
    // 移除开头和末尾的 "/"
    url = url.replace(/^\//, '')
        .replace(/\/$/, '');

    var reg = convertPathSyntaxToReg(url);

    if (reqURL.toLowerCase() === url.toLowerCase() 
            || reg.test(reqURL)) {
        return true;
    }

    return false;
}

function getMatchingData(filePath, url, method) {
    let mockData = require(filePath) || [];

    if (typeof mockData === 'object' && !Array.isArray(mockData)) {
        mockData = [mockData];
    }

    return mockData.find((data) => {
        return isMatchingData(url, method, data);
    });
}

function searchMatchingData(url, method, dataPath, sort) {
    var filenames = fs.readdirSync(dataPath);
    
    if (filenames && filenames.length > 0) {
        // 文件排序
        filenames = sort && sort(filenames) || [];
        // 遍历所有 mock 数据
        for (let i = 0; i < filenames.length; i++) {
            let filename = filenames[i];
            let filePath = path.join(dataPath, filename);
            let fileStat = fs.statSync(filePath);
            
            // 是文件则对比请求与文件中的 mock 数据是否匹配
            if (fileStat.isFile()) {
                let matchingData = getMatchingData(filePath, url, method);
                // 如果找到了则返回, 未找到继续递归查找.
                if (matchingData) {
                    return matchingData;
                }
            // 是目录则继续递归
            } else if (fileStat.isDirectory()) {
                return searchMatchingData(url, method, filePath);
            }
        }
    }    
}

module.exports = {
    formatObjectKey,
    searchMatchingData
};