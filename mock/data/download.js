module.exports = [{
    request: {
        url: '/download/:filename',
        method: 'get'
    },
    response: {
        delay: 2000,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment;filename=sample.txt;'
        },
        body: '<static>/sample.txt'
    }
}];
