# express-pictionairy

A game based on the popular game pictionairy, but a bit different.



## Installation

Install these dependencies:
```
npm install body-parser@1.19.0
npm install express-ws@4.0.0
npm install express@4.17.1
npm install socket.io@4.0.0
npm install websocket@1.0.33
npm install ws@7.4.4
```
Change the ip adress in ```game.js``` to your servers ip adress.

Run the server file with
```
node server.js
```

Now, you can navigate to ```localhost:3000``` in your browser and to your servers ip adress on the other client devices. On this site, enable the Allow CORS chrome plugin, you can install that [here](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf).



## Documentation
This server follows the guidelines for a REST api. This list shows all endpoints, except those that just return one file. All endpoints start with ```/api/```.

### HTTP endpoints

#### /api/join [POST]
Request should include ```nickname``` and ```gamecode``` in request body. Redirects client to ```/g/<gamecode>``` if all data is correct. If the gamecode does not exist, the nickname is already chosen or the room is full, the server sends these responses:

```
404: Game not Found
400: Name already taken
400: Room full
```



#### /api/host [POST]
Request should include ```nickname``` and ```gamecode``` in request body. Redirects client to ```/g/<gamecode>``` if all data is correct.



#### /api/lines/<gamecode> [GET]
Returns a list with line segments for the given gamecode in this format:

```
[
 {
    oldX: <x start of line>,
    oldY: <y start of line>,
    x: <x end of line>,
    y: <y end of line>
  },
  ... same for next line segment
]
```
  

  
#### /api/words/<gamecode> [GET]
Returns an objects with the words for the given gamecode in this format:

```
{
  who: <who>,
  what: <what>,
  where: <where>
}
```

  

#### /api/players/<gamecode> [GET]
Returns an objects with the players for the given gamecode in this format:

```
[
  {
    role: "Tekenaar",
    status: "Waiting",
    score: 0
  },
  ... same for next player
]
```
```role``` can be ```"Tekenaar"```, ```"Wie"```, ```"Wat"``` or ```"Waar"```. ```status``` is not used yet but will be in future updates.

 
 
 ### SOCKET.IO endpoints
 
 
 #### addLine [POST]
 Method for adding a new line segment to the drawing. Segments should be provided in this format:
 
```
{
   oldX: <x start of segment>,
   oldY: <y start of segment>,
   x: <x end of segment>,
   y: <y end of segment>
 }
```
 
 
#### wordSubmission [POST]
Method for submitting a word. Words should be longer than 2 characters, as tested on the client side. Submission shoudl follow this format:

```
["who", "John Johnson"]
```
First element can be ```who```, ```what``` or ```where```.
 

 
#### wordGuessed [POST]
Method for telling the server that the client guessed one of the words. Nickname is provided in this format:
 
```
["<nickname>"]
```
