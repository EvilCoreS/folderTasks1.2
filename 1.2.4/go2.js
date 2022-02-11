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
    let temp = headers.map(arr => arr.join(": "))
    temp = temp.join("\n")
    let output = `HTTP/1.1 ${String(statusCode)} ${String(statusMessage)}
Date: ${String(new Date())}
Server: Apache/2.2.14 (Win32)
Content-Length: ${String(body).length}
Connection: Closed
Content-Type: text/html; charset=utf-8
`
    output += temp + "\n"
    output += "\n" + body
    console.log(output)
}

function processHttpRequest(method, uri, headers, body) {
    let passwords
    let result = []
    try {
        passwords = require("fs").readFileSync("passwords.txt").toString().split("\n").map(element => {return element.replace("\r", "")})
    }
    catch {
        result = ["500", "Internal Server Error", headers, "not found"]
        outputHttpResponse(result[0], result[1], result[2], result[3])
        return
    }
    let currentLogin = body.match(/=[a-z0-9]+/ig).map(element => {return element.replace("=", "")}).join(":")
    let status
    passwords.forEach(element => {if (element === currentLogin) {status = true} } )
    if (method === "POST" && /\/api\/checkLoginAndPassword/ig.test(uri) && status === true && headers[1][1] === "application/x-www-form-urlencoded"){
        result = ["200", "OK", headers, "<h1 style=\"color:green\">FOUND</h1>"]
    }
    if (method === "POST" && !(/\/api/ig.test(uri) ) ){
        result = ["404", "Not Found", headers, "not found"]
    }
    if (method === "POST" && status !== true){
        result = ["400", "Bad Request", headers, "login&pass not found"]
    }
    if (method !== "POST" || /\/api/ig.test(uri) || headers[1][1] !== "application/x-www-form-urlencoded"){
        if ( !(/\/api\/checkLoginAndPassword/ig.test(uri) || method !== "POST" || headers[1][1] !== "application/x-www-form-urlencoded") ){
            result = ["400", "Bad Request", headers, "not found"]
        }
    }
    outputHttpResponse(result[0], result[1], result[2], result[3])
}
function parseTcpStringAsHttpRequest(string) {
    let reForMethod = /^[A-Z]+/ig,
        reForUri = /\/[a-z?]+[\/?][a-z]+(=[0-9,]+)?/ig,
        reForHeaders = /^[a-z\-]+: [ a-z.,0-9\/\-*]+/img,
        reForBody = /[a-z0-9]+=[0-9a-z&]+=[a-z+0-9]+/ig

    let validMethod = string.match(reForMethod),
        validUri = string.match(reForUri),
        validHeaders = string
            .match(reForHeaders)
            .map(str => {return str.split(": ")}),
        validBody = string.match(reForBody)
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
