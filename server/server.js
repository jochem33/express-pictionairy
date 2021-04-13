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


    socket.on('message', (msg) => {
        console.log('message: ' + msg)
    })

    socket.on('addLine', (newLine) => {
        console.log(lines.length)
        lines.push(newLine)
        io.emit("emitLines", lines)
    })
})




http.listen(3000, () => {
    console.log('listening on *:3000')
})