const socket = io("ws://localhost:3000");

let testbutton = document.getElementById("testbutton")

socket.on("connect", () => {
  socket.send("Hello!");

  socket.emit("testEvent", "Hello2!");
});

// handle the event sent with socket.send()
socket.on("message", data => {
  console.log(data);
});

// handle the event sent with socket.emit()
socket.on("greetings", (elem1, elem2, elem3) => {
  console.log(elem1, elem2, elem3);
});

testbutton.addEventListener('mousedown', function(e) {
  e.preventDefault();
  socket.emit('buttonDown', e.button, e.clientX, e.clientY);
});



// testbutton.addEventListener('mousedown', function(e) {
//   e.preventDefault();
//   if (input.value) {
//     socket.emit('chat message', input.value);
//     input.value = '';
//   }
// });