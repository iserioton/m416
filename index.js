const https = require('https');

function m416(address = '', method = 'GET', data = {}, headers = {}) {
    let url = new URL(address);

    if (!Object.keys(headers).length) {
        headers = {
            'Content-Type': 'application/json'
        }
    }

    let options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: method,
        headers
    }

    if (['GET', 'DELETE'].includes(method) && Object.keys(data).length) {
        options.path += '?' + JSON.stringify(data);
    }

    const req = https.request(options, res => {
        let status = res.statusCode, message = res.message, tempBuffer = [];
        res.on('data', chunk => {
            tempBuffer.push(chunk)
        })
        res.on('end', function () {
            tempBuffer = Buffer.concat(tempBuffer).toString();
            return {
                status,
                data: tempBuffer,
                message
            }
        })
    })

    req.on('error', error => {
        return {
            status: 512,
            message: error.message,
            data: error.stack
        }
    })

    if (['POST', 'PUT'].includes(method) && Object.keys(data).length) {
        req.write(JSON.stringify(data))
    }

    req.end();
}

module.exports = m416;