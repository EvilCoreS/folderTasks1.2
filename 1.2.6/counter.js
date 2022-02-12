const express = require("express")
const counter = express()
const port = 3000
const fs = require('fs')


counter.get("/hello", function (req, res){
    let count = fs.readFileSync("counterLogins.txt").toString()
    fs.writeFileSync("counterLogins.txt", String(Number(count)+1))
    res.send(`Hello World! Counter: ${count}`)
})

counter.listen(port, () => {
    console.log(`Listening on ${port}`)
})