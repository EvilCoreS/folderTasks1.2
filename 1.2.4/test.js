let string = "login=student&password=12345"
let buff
try {
    buff = require("fs").readFileSync("passswords.txt")
    console.log(buff.toString())
}
catch {
    console.log("error")
}