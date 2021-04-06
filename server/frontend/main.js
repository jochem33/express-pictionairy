const socket = io("ws://localhost:3000")


socket.on("connect", () => {
  socket.emit("message", "Connected!")
})
