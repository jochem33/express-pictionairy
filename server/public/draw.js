// const gamecode = window.location.href.split("/")[window.location.href.split("/").length - 1]
const gamecode = localStorage.getItem("gamecode");
const nickname = localStorage.getItem("nickname");

const socket = io("ws://localhost:3000", {query: "gameCode=" + gamecode})

socket.on("connect", () => {
  socket.emit("message", "Connected!")
})



let oldMouseX = 0;
let oldMouseY = 0;

let lines = []
fetch('http://localhost:3000/api/lines/' + gamecode)
  .then(response => response.json())
  .then(json => lines = json)

function fetchPlayers(){
    fetch('http://localhost:3000/api/players/' + gamecode)
        .then(response => response.json())
        .then(json => {
            let players = json
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

fetchPlayers()

let screenW = window.innerWidth
let screenH = window.innerHeight


function setup() {
    let canvasHeight = screenH * 0.7
    let canvasWidth = screenH

    // if(window.innerWidth > window.innerHeight){
    //     canvasWidth = canvasHeight
    // } else {
    //     canvasHeight = canvasWidth
    // }
    let renderer = createCanvas(canvasWidth, canvasHeight)
    renderer.parent(document.getElementById("canvasContainer"))
}

function draw() {
    background(255);

    for(let i = 0; i < lines.length; i++){
        line(lines[i].oldX, lines[i].oldY, lines[i].x, lines[i].y)
    }
}

function mousePressed() {
    console.log("mouse Pressed")
    oldMouseX = mouseX
    oldMouseY = mouseY
}

function mouseDragged() {
    let newLine = {
        oldX: oldMouseX,
        oldY: oldMouseY,
        x: mouseX,
        y: mouseY
    }
    lines.push(newLine)

    socket.emit("addLine", newLine);

    oldMouseX = mouseX
    oldMouseY = mouseY
}

socket.on("emitLines", (newLines) => {
    lines = newLines
    console.log("updated lines")
})

socket.on("playerUpdate", () => {
    fetchPlayers()
    console.log("updated players")
})