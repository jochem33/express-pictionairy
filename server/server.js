// import needed packages
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require("body-parser")

// static files are stored in 'public' folder
app.use(express.static('public'))

// use bodyparser for parsing POST requests
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Data object (needs to be moved to database)
let gameData = {
    "defaultGame": {
        lines: [],
        players: {}
    }
}

// routes for Home, join and host page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html')
})

app.get('/join', (req, res) => {
    res.sendFile(__dirname + '/frontend/join.html')
})

app.get('/host', (req, res) => {
    res.sendFile(__dirname + '/frontend/host.html')
})



app.post('/api/join/', (req, res) => {
    const nickname = req.body.nickname
    const gamecode = req.body.gamecode

    // if game does not exist
    if(!Object.keys(gameData).includes(gamecode)){
        res.status(404).send('404: Game not Found')
        return
    }

    // if nickname is already taken
    if(Object.keys(gameData[gamecode].players).includes(nickname)) {
        res.send('Name already taken')
        return
    }
    let playercount = Object.keys(gameData[gamecode].players).length

    // if room is full
    if(playercount >= 4){
        res.send('Room full')
        return
    }

    // if everything is OK, assign a role and make a new dataBase entry for the player
    let role
    if(playercount == 2){
        role = "Wie"
    } else if(playercount == 3){
        role = "Wat"
    } else {
        role = "Waar"
    }
    gameData[gamecode].players[nickname] = {
        role: role,
        score: 0
    }

    // emit to every player that there is a new player
    io.in(gamecode).emit("playerUpdate", "")
    res.redirect('/g/' + req.body.gamecode)   
})


// route for hosting a game
app.post('/api/host', (req, res) => {
    gameData[req.body.gamecode] = {
        lines: [],
        players: {},
        gamestate: "WAIT"
    }
    gameData[req.body.gamecode].players[req.body.nickname] = {
        role: "Tekenaar",
        score: 0
    }
    res.redirect('/g/' + req.body.gamecode)
})



// route for getting the current drawing when joining a game
app.get('/api/lines/:gamecode', (req, res) => {
    res.send(gameData[req.params.gamecode].lines)
})

// route for getting the playerdata when joining a game or after a state update
app.get('/api/players/:gamecode', (req, res) => {
    res.send(gameData[req.params.gamecode].players)
})



// route for getting the main html for the game
app.get('/g/:gameCode', (req, res) => {
    if(Object.keys(gameData).includes(req.params.gameCode)){
        res.sendFile(__dirname + '/frontend/game.html')
    } else {
        res.status(404).send('404: Page not Found')
    }
})



// function for all socket connections
io.on('connection', (socket) => {
    // add new connection to game room
    socket.join(socket.handshake.query["gameCode"])
    console.log("New user, room = ", Array.from(socket.rooms)[1])

    // announce updated gamestate to players
    stateUpdate(socket)

    // when a new line is received, sent line object to all players
    socket.on('addLine', (newLine) => {
        let gameCode = Array.from(socket.rooms)[1]
        if(gameCode.length > 0){
            gameData[gameCode]["lines"].push(newLine)
            socket.in(gameCode).emit("emitLines", gameData[gameCode]["lines"])
        }
    })
})


// function for updating the state of a game
function stateUpdate(socket) {
    let gameCode = Array.from(socket.rooms)[1]
    if(Object.keys(gameData).includes(gameCode)){
        io.in(gameCode).emit("stateUpdate", gameData[gameCode].gamestate)
    }
}


// start server
http.listen(3000, () => {
    console.log('listening on *:3000')
})