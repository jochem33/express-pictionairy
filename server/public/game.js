const baseURL = "http://localhost:3000"
const socketURL = "ws://localhost:3000"

// get data from local storage
const gamecode = localStorage.getItem("gamecode")
const nickname = localStorage.getItem("nickname")

// get word inputs and role text element from document
const roleText = document.getElementById("roleText")

const who = document.getElementById("who")
const what = document.getElementById("what")
const where = document.getElementById("where")

let drawingEnabled = false
let gamestate = "WAIT"
let lines = []

let words = {}

// connect to websocket via socket.io
const socket = io(socketURL, {query: "gameCode=" + gamecode})


// gets already drawn lines from server
function fetchLines(){
    fetch(baseURL + "/api/lines/" + gamecode)
    .then(response => response.json())
    .then(json => lines = json)
}


// get playerdata from server
function fetchPlayers() {
    return new Promise(function(resolve, reject){
        fetch(baseURL + "/api/players/" + gamecode)
        .then(response => response.json())
        .then(json => {
            let players = json
            let playerNames = Object.keys(players)
            let playerlist = document.getElementById("playerlist")
            
            // clear current player list
            while (playerlist.firstChild) {
                playerlist.removeChild(playerlist.firstChild);
            }

            // create player table and insert data
            for(let i = 0; i < playerNames.length; i++){
                let player = playerlist.insertRow(i)
                let name = player.insertCell(0)
                let score = player.insertCell(1)
                name.innerHTML = playerNames[i]
                score.innerHTML = players[playerNames[i]].score

                player.classList.add("player")
                player.classList.add("box")

                name.classList.add("playerName")
                score.classList.add("playerScore")
            }

            // resolve promise
            resolve(players)
        })
    })
}




// get words from server
function fetchWords() {
    return new Promise(function(resolve, reject){
        fetch(baseURL + "/api/words/" + gamecode)
        .then(response => response.json())
        .then(wordData => {
            resolve(wordData)
        })
    })
}



// refresh all lines 
socket.on("emitLines", (newLines) => {
    lines = newLines
    console.log("updated lines")
})


// make a request for updating playerData when an update is anounced
socket.on("playerUpdate", () => {
    fetchPlayers()
    console.log("updated players")
})


// when the gamestate is updated, refresh the roles of all players
socket.on("stateUpdate", (state) => {
    gamestate = state
    clearCanvas()
    fetchPlayers().then((players) => {
        let role = players[nickname].role
        let status = players[nickname].status

        roleText.innerHTML = role

        drawingEnabled = (role == "Tekenaar" && gamestate == "DRAW") ? true : false
        updateInputState(role, status, gamestate)

        if(gamestate == "DRAW") {
            fetchWords().then((wordData) => {
                words = wordData
                if(role == "Tekenaar"){
                    who.value = wordData.who
                    what.value = wordData.what
                    where.value = wordData.where
                }
            }) 
        }

        console.log("updated gamestate", gamestate)
    }) 
})


// change the typabillity of the inputs based on the current gamestate
function updateInputState(role, status, gamestate){
    if(gamestate == "WAIT"){
        switch(role) {
            case "Tekenaar":
                    who.disabled = true
                    what.disabled = true
                    where.disabled = true
                break
            case "Wie":
                    who.disabled = false
                    what.disabled = true
                    where.disabled = true
                break
            case "Wat":
                    who.disabled = true
                    what.disabled = false
                    where.disabled = true
                break
            case "Waar":
                    who.disabled = true
                    what.disabled = true
                    where.disabled = false
                break
            default:
                who.disabled = true
                what.disabled = true
                where.disabled = true
        }
    } else if(gamestate == "DRAW"){
        switch(role) {
            case "Tekenaar":
                    who.disabled = true
                    what.disabled = true
                    where.disabled = true
                break
            case "Wie":
                    who.disabled = true
                    what.disabled = false
                    where.disabled = false
                break
            case "Wat":
                    who.disabled = false
                    what.disabled = true
                    where.disabled = false
                break
            case "Waar":
                    who.disabled = false
                    what.disabled = false
                    where.disabled = true
                break
            default:
                who.disabled = true
                what.disabled = true
                where.disabled = true
        }
    }
}


fetchPlayers()
fetchLines()