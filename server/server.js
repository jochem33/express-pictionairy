const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static('public'))


let gameData = {
    "defaultGame": {
        lines: [],
        players: {}
    }
}

let lines = []



app.get('/api/lines', (req, res) => {
    res.send(lines)
})



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html')
})



app.post('/api/host', (req, res) => {
    res.redirect('/g/' + gameCode)
})


app.get('/g/:gameCode', (req, res) => {
    console.log(req.params.gameCode, Object.keys(gameData))
    if(Object.keys(gameData).includes(req.params.gameCode)){
        res.sendFile(__dirname + '/frontend/game.html')
    } else {
        res.status(404).send('404: Page not Found')
    }
})



io.on('connection', (socket) => {
    console.log('a user connected')
    socket.emit("message", "Connected!")
    console.log("gamecode = ", socket.handshake.query["gameCode"])

    socket.join(socket.handshake.query["gameCode"])
    console.log("current room: ", Array.from(socket.rooms)[1])

    socket.on('message', (msg) => {
        console.log('message: ' + msg)
    })

    socket.on('addLine', (newLine) => {
        console.log(lines.length)
        lines.push(newLine)
        socket.in(Array.from(socket.rooms)[1]).emit("emitLines", lines);
        // socket.in(socket.rooms[1]).emit("emitLines", lines);
    })
})




http.listen(3000, () => {
    console.log('listening on *:3000')
})