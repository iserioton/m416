const https = require('https');

function m416(address = '', method = 'GET', data = {}, headers = {}) {
    return new Promise((resolve) => {
        try {
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
                    resolve({
                        status,
                        data: tempBuffer,
                        message
                    });
                })
            })

            req.on('error', error => {
                resolve({
                    status: 512,
                    message: error.message,
                    data: error.stack
                });
            })

            if (['POST', 'PUT'].includes(method) && Object.keys(data).length) {
                req.write(JSON.stringify(data))
            }

            req.end();

        } catch (e) {
            resolve(e)
        }
    })
}

async function fetchData(rUrl, query = {}, method = 'GET', headers = {}) {
    try {
        let call_parameter = {
            method,
            headers: Object.assign({
                'Content-Type': 'application/json;charset=UTF-8'
            }, headers)
        }
        if (Object.keys(query).length) {
            if (['POST', 'PUT'].includes(method)) {
                call_parameter.body = JSON.stringify(query);
            } else if (['GET', 'DELETE'].includes(method)) {
                rUrl += `?${objIntoParams(query)}`;
            }
        }
        let responcedData = await fetch(rUrl, call_parameter);
        if (responcedData?.ok) {
            responcedData = await responcedData.json();
        }
        return responcedData;
    } catch (e) {
        console.error('ODD: ', e);
        return {};
    }
}

function objIntoParams(obj, prefix) {
    var str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                objIntoParams(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

module.exports = m416;

