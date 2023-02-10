module.exports = {
    port: 3000,
    response: {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, token',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
            // 'Cache-Control': 'no-cache',
            // 'Pragma': 'no-cache',
            // 'Expires': '-1'
        }
    }
};