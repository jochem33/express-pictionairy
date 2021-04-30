const gamecode = window.location.href.split("/")[window.location.href.split("/").length - 1]


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

let players = {}
fetch('http://localhost:3000/api/players/' + gamecode)
  .then(response => response.json())
  .then(json => players = json)
  .then(pl => console.log(pl))


let screenW = window.innerWidth
let screenH = window.innerHeight


function setup() {
    let canvasHeight = screenH * 0.8
    let canvasWidth = screenW * 0.8

    if(window.innerWidth > window.innerHeight){
        canvasWidth = canvasHeight
    } else {
        canvasHeight = canvasWidth
    }
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
    console.log("updates lines")
})