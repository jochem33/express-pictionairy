// import needed packages
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require("body-parser")

// allow cors?
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})


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
    let status
    if(playercount == 2){
        role = "Wie"
        status = "Thinking who"
    } else if(playercount == 3){
        role = "Wat"
        status = "Thinking what"
    } else {
        role = "Waar"
        status = "Thinking where"
    }
    gameData[gamecode].players[nickname] = {
        role: role,
        status: status,
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
        gamestate: "WAIT",
        words: {
            // who: "",
            // what: "",
            // where: ""
        },
        guessCount: 0
    }
    gameData[req.body.gamecode].players[req.body.nickname] = {
        role: "Tekenaar",
        status: "Waiting",
        score: 0
    }
    res.redirect('/g/' + req.body.gamecode)
})



// route for getting the current drawing when joining a game
app.get('/api/lines/:gamecode', (req, res) => {
    res.send(gameData[req.params.gamecode].lines)
})

// route for getting the current words when joining a game
app.get('/api/words/:gamecode', (req, res) => {
    res.send(gameData[req.params.gamecode].words)
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
        const gameCode = Array.from(socket.rooms)[1]
        if(gameCode.length > 0){
            gameData[gameCode]["lines"].push(newLine)
            socket.in(gameCode).emit("emitLines", gameData[gameCode]["lines"])
        }
    })

    // when a word is submitted
    socket.on('wordSubmission', (wordData) => {
        const gameCode = Array.from(socket.rooms)[1]
        gameData[gameCode].words[wordData[0]] = wordData[1]
        const wordCount = Object.keys(gameData[gameCode].words).length
        if(wordCount == 3){
            gameData[gameCode].gamestate = "DRAW"
            stateUpdate(socket)
        }
    })



    // when a word is guessed
    socket.on('wordGuessed', (guessData) => {
        const gameCode = Array.from(socket.rooms)[1]
        gameData[gameCode].players[guessData[0]].status = "Guessed"
        gameData[gameCode].players[guessData[0]].score += 100
        gameData[gameCode].guessCount += 1

        if(gameData[gameCode].guessCount == 6){
            gameData[gameCode].gamestate = "WAIT"
            gameData[gameCode].guessCount = 0
            gameData[gameCode].words = {}

            let players = Object.keys(gameData[gameCode].players)
            for (let i = 0; i < players.length; i++) {
                switch(gameData[gameCode].players[players[i]].role) {
                    case "Tekenaar":
                            gameData[gameCode].players[players[i]].role = "Wie"
                        break
                    case "Wie":
                            gameData[gameCode].players[players[i]].role = "Wat"
                        break
                    case "Wat":
                            gameData[gameCode].players[players[i]].role = "Waar"
                        break
                    case "Waar":
                            gameData[gameCode].players[players[i]].role = "Tekenaar"
                        break
                }
            }
            

            stateUpdate(socket)
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