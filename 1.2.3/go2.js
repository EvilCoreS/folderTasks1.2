function readHttpLikeInput(){
    var fs = require("fs");
    var res = "";
    var buffer = Buffer.alloc ? Buffer.alloc(1) : new Buffer(1);
    let was10 = 0;
    for(;;){
        try { fs.readSync(0 /*stdin fd*/, buffer, 0, 1); } catch (e) {break; /* windows */}
        if(buffer[0] === 10 || buffer[0] === 13) {
            if (was10 > 10)
                break;
            was10++;
        } else
            was10 = 0;
        res += new String(buffer);
    }

    return res;
}

let contents = readHttpLikeInput();

function outputHttpResponse(statusCode, statusMessage, headers, body) {

    console.log(`HTTP/1.1 ${statusCode} ${statusMessage}
Date: ${new Date()}
Server: Apache/2.2.14 (Win32)
Connection: Closed
Content-Type: text/html; charset=utf-8
Content-Length: ${String(body).length}

${body}`);
}

function processHttpRequest(method, uri, headers, body) {
    let result = []
    if (method === "GET" && /\/sum\?nums=[0-9,]+/g.test(uri)){
        let numbers = uri.match(/[0-9]+/g)
        let sum = 0
        numbers.forEach(number => {
            sum += Number(number)
        })
        result = ["200", "OK", headers, sum];
    }
    if (method === "GET" && !(/^\/sum/g.test(uri))){
        result = ["404", "Not Found", headers, "not found"]
    }
    if (method !== "GET" || /\/sum/g.test(uri)){
        if ( !(/\/sum\?nums=[0-9,]+/g.test(uri) ) || method !== "GET"){
            result = ["400", "Bad Request", headers, "not found"]
        }
    }
    outputHttpResponse(result[0], result[1], result[2], result[3])
}

function parseTcpStringAsHttpRequest(string) {
    let reForMethod = /^[A-Z]+/ig,
        reForUri = /\/[a-z?]+[\/?][a-z]+(=[0-9,]+)?/ig,
        reForHeaders = /^[a-z\-]+: [ a-z.,0-9\/\-*]+/img,
        reForBody = /[a-z0-9]+=[0-9a-z&]+=[a-z+]+/ig

    let validMethod = string.match(reForMethod),
        validUri = string.match(reForUri),
        validHeaders = string
            .match(reForHeaders)
            .map(str => {return str.split(": ")}),
        validBody = string.match(reForBody)
    if (validHeaders[0][0] !== "Host"){
        validHeaders[0][0] = "Host"
    }
    let result
    if (validBody !== null){
        result = {
            method: validMethod[0],
            uri: validUri[0],
            headers: validHeaders,
            body: validBody[0]
        }
    }
    else {
        result = {
            method: validMethod[0],
            uri: validUri[0],
            headers: validHeaders
        }
    }
    return result;
}

http = parseTcpStringAsHttpRequest(contents);
processHttpRequest(http.method, http.uri, http.headers, http.body);