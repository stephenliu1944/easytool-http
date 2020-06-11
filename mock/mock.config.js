var pkg = require('../package.json');

const { servers } = pkg.devEnvironments;

module.exports = {
    port: servers.mock,
    response: {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
            // 'Cache-Control': 'no-cache',
            // 'Pragma': 'no-cache',
            // 'Expires': '-1'
        }
    }
};