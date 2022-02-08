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

// вот эту функцию собственно надо написать
function parseTcpStringAsHttpRequest(string) {
    let reForMethod = /^[A-Z]+/ig,
        reForUri = /\/[a-z]+\/[a-z]+/ig,
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

    return {
        method: validMethod[0],
        uri: validUri[0],
        headers: validHeaders,
        body: validBody[0]
    };
}

http = parseTcpStringAsHttpRequest(contents);
console.log(JSON.stringify(http, undefined, 2));