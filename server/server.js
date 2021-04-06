const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

let lines = []


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html')
})

app.get('/main.js', (req, res) => {
    res.sendFile(__dirname + '/frontend/main.js')
})

app.get('/draw.js', (req, res) => {
    res.sendFile(__dirname + '/frontend/draw.js')
})



app.get('/api/lines', (req, res) => {
    res.send(lines)
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