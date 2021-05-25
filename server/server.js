const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require("body-parser")


app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let gameData = {
    "defaultGame": {
        lines: [],
        players: {}
    }
}


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html')
})



app.get('/join', (req, res) => {
    res.sendFile(__dirname + '/frontend/join.html')
})

app.post('/api/join/', (req, res) => {
    const nickname = req.body.nickname
    const gamecode = req.body.gamecode
    if(Object.keys(gameData).includes(gamecode)){
        if(!Object.keys(gameData[gamecode].players).includes(nickname)) {
            console.log(Object.keys(gameData[gamecode].players).length)
            if(Object.keys(gameData[gamecode].players).length < 4){
                gameData[gamecode].players[nickname] = {
                    role: "0",
                    score: 0
                }

                io.in(gamecode).emit("playerUpdate", "")
                res.redirect('/g/' + req.body.gamecode)
            } else {
                res.send('Room full')
            }
        } else {
            res.send('Name already taken')
        }
    } else {
        res.status(404).send('404: Game not Found')
    }
})



app.get('/host', (req, res) => {
    res.sendFile(__dirname + '/frontend/host.html')
})

app.post('/api/host', (req, res) => {
    console.log(req.body.nickname, req.body.gamecode, req.body.private)
    gameData[req.body.gamecode] = {
        lines: [],
        players: {},
        gamestate: "WAIT"
    }
    gameData[req.body.gamecode].players[req.body.nickname] = {
        role: "Drawer",
        score: 0
    }
    res.redirect('/g/' + req.body.gamecode)
})



app.get('/api/lines/:gamecode', (req, res) => {
    res.send(gameData[req.params.gamecode].lines)
})


app.get('/api/players/:gamecode', (req, res) => {
    res.send(gameData[req.params.gamecode].players)
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

    stateUpdate(socket)

    socket.on('message', (msg) => {
        console.log('message: ' + msg)
    })

    socket.on('addLine', (newLine) => {
        let gameCode = Array.from(socket.rooms)[1]
        if(gameCode.length > 0){
            console.log(gameCode)
            gameData[gameCode]["lines"].push(newLine)
            socket.in(gameCode).emit("emitLines", gameData[gameCode]["lines"])
        }
    })
})


function stateUpdate(socket) {
    let gameCode = Array.from(socket.rooms)[1]
    if(Object.keys(gameData).includes(gameCode)){
        io.in(gameCode).emit("stateUpdate", gameData[gameCode].gamestate)
    }
}

http.listen(3000, () => {
    console.log('listening on *:3000')
})