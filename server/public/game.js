// const gamecode = window.location.href.split("/")[window.location.href.split("/").length - 1]
const gamecode = localStorage.getItem("gamecode");
const nickname = localStorage.getItem("nickname");

const roleText = document.getElementById("roleText")

const who = document.getElementById("who")
const what = document.getElementById("what")
const where = document.getElementById("where")


let oldMouseX = 0;
let oldMouseY = 0;

let players = {}

let lines = []


const socket = io("ws://localhost:3000", {query: "gameCode=" + gamecode})

socket.on("connect", () => {
  socket.emit("message", "Connected!")
})



function fetchLines(){
    fetch('http://localhost:3000/api/lines/' + gamecode)
    .then(response => response.json())
    .then(json => lines = json)
}


function fetchPlayers(){
    fetch('http://localhost:3000/api/players/' + gamecode)
        .then(response => response.json())
        .then(json => {
            players = json
            let playerNames = Object.keys(players)
            console.log(players)
            let playerlist = document.getElementById("playerlist")
            while (playerlist.firstChild) {
                playerlist.removeChild(playerlist.firstChild);
            }
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

            return players
        })
    }






socket.on("emitLines", (newLines) => {
    lines = newLines
    console.log("updated lines")
})

socket.on("playerUpdate", () => {
    fetchPlayers()
    console.log("updated players")
})

socket.on("stateUpdate", (gamestate) => {
    fetchPlayers()
    let role = players[nickname].role
    roleText.innerHTML = role

    updateInputState(role)

    console.log("updated gamestate", gamestate)
})


function updateInputState(role){
    switch(role) {
        case "Drawer":
                who.disabled = true
                what.disabled = true
                where.disabled = true
            break
        case "Who":
                who.disabled = false
                what.disabled = true
                where.disabled = true
            break
        case "What":
                who.disabled = true
                what.disabled = false
                where.disabled = true
            break
        case "Where":
                who.disabled = true
                what.disabled = true
                where.disabled = false
            break
        default:
            who.disabled = true
            what.disabled = true
            where.disabled = true
    }
}


fetchPlayers()
fetchLines()