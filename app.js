let express = require("express");
let app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http);
let bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let rooms = {"master-bed": ["Anthony", "Estey"]};

app.get("/", function(req, res) {
    res.render("home", {rooms: rooms});
});

app.get("/room/:roomName", function(req, res) {
    let roomName = req.params.roomName;
    console.log("Room is " + roomName);
    res.render("room", {queue: rooms[roomName]});
});

app.post("/createRoom", function(req, res) {
    let newRoom = req.body.newRoom;
    newRoom = newRoom.replace(/ /g, "-");
    if (!rooms.hasOwnProperty(newRoom)) {
        rooms[newRoom] = [];  
    } else {
        console.log("room exists");
    }
    res.redirect("/");
});

io.on('connection', function(socket){
    console.log('a user connected!!!! woo');
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    
    socket.on('enqueue', function(roomNStudent){
        let roomName = Object.keys(roomNStudent)[0];
        let student = roomNStudent[roomName];
        
        io.emit('enqueue', student);

        rooms[roomName].push(student);
        
        console.log("Tried (perhaps succeeded) to add student in: "+ rooms[roomName]);
    });
        
    socket.on('dequeue', function(roomNStudent){
        let roomName = Object.keys(roomNStudent)[0];
        let student = roomNStudent[roomName];
        student = student.replace(/\s+$/, '');   // OK BUT WHY!!!
        
        io.emit('dequeue', student);
        console.log(student);
        console.log(rooms[roomName][0]);
        
        let i = rooms[roomName].indexOf(student);
        if (i !== -1) {
            rooms[roomName].splice(i, 1);
            console.log("Succeeded in removing student in: "+ rooms[roomName]);
        } else {
            console.log("Failed to remove student in: "+ rooms[roomName]);
        }
    });
});

http.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server is listening!!!\nCheck https://q-totype-marshmallowsunshinecafe.c9users.io/");
});