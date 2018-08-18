let express = require("express");
let app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http);
let bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let rooms = {
    "master-bed": ["Anthony", "Estey"],
    "everlong" : ["Hello,", "I've", "waited", "here", "for", "you"]
};

app.get("/", function(req, res) {
    res.render("home", {rooms: rooms});
});

app.get("/room/:roomName", function(req, res) {
    let roomName = req.params.roomName;
    console.log("Room is " + roomName);
    if (!rooms.hasOwnProperty(roomName)) {
        res.redirect("/bizarroWorld");
    } else {
        res.render("room", {queue: rooms[roomName], roomName:roomName});
    }

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

app.get("/destroyRoom/:roomName", function(req, res) {
    let roomName = req.params.roomName;
    
    console.log("roomName is: " + roomName);
    console.log("rooms were: " + Object.keys(rooms).length);
    
    delete rooms[roomName];
    
    console.log("rooms are now: " + Object.keys(rooms).length);
    
    res.redirect("/");
});

app.get("/bizarroWorld", function(req, res) {
    let rand = Math.random();
    if (rand < 0.5) {
        res.redirect("http://www.zombo.com/");
    } else {
        res.send("Aren't we all just the universe loving, hating, and trying to figure itself out?");      
    }
});

app.get("*", function(req, res) {
   res.redirect("/bizarroWorld"); 
});

io.on('connection', function(socket){
    console.log('a user connected!!!! woo');
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    
    socket.on('enqueue', function(roomNStudent){
        let roomName = Object.keys(roomNStudent)[0];
        let student = roomNStudent[roomName];
        student = student.replace(/\s+$/, '');
        
        io.emit('enqueue', student);

        rooms[roomName].push(student);
        
        console.log("Tried (perhaps succeeded) to add " + student + " in: " + roomName);
    });
        
    socket.on('dequeue', function(roomNStudent){
        let roomName = Object.keys(roomNStudent)[0];
        let student = roomNStudent[roomName];
        student = student.replace(/\s+$/, '');   // OK BUT WHY!!!
        
        io.emit('dequeue', student);
        
        let i = rooms[roomName].indexOf(student);
        if (i !== -1) {
            rooms[roomName].splice(i, 1);
            console.log("Succeeded in removing " + student + " in " + roomName);
        } else {
            console.log("Failed to remove " + student + " in " + roomName);
        }
    });
});

http.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server is listening!!!\nCheck https://q-totype-marshmallowsunshinecafe.c9users.io/");
});