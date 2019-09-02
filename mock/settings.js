// 全局配置
module.exports = {
    response: {
        headers: {
            'Mock-Data': 'true',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': 'http://localhost:8888',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Token'
        }
    },
    dataPath: '/data',
    resourcesPath: '/resources',
    sort(filenames) {
        return filenames.sort();
    }
};
