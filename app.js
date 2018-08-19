let express = require("express"),
    app = express(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");
    
//mongoose.connect("mongodb://localhost/deja_q", { useNewUrlParser: true });
mongoose.connect("mongodb://deja-q-admin:dejaqpw01@ds225902.mlab.com:25902/deja-q", { useNewUrlParser: true });
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let rooms = {
    "master-bed": ["Anthony", "Estey"],
    "everlong" : ["Hello,", "I've", "waited", "here", "for", "you"]
};

var roomSchema = new mongoose.Schema({
    name: String,
    queue: [String] 
});

var Room = mongoose.model("Room", roomSchema);

app.get("/", function(req, res) {
    Room.find({}, function(err, rooms) {
        if (err) {
            console.log(err);
        } else {
            res.render("home", {rooms: rooms});  
        }
    });
});

app.get("/room/:roomName", function(req, res) {
    let roomName = req.params.roomName;
    Room.findOne({name: roomName}, function(err, room) {
        if (err) {
            console.log(err);
            res.redirect("/bizarroWorld");
        } else {
            console.log("Room is " + roomName);
            res.render("room", {queue: room["queue"], roomName:roomName});
        }
    });
});

app.post("/createRoom", function(req, res) {
    let newRoom = req.body.newRoom;
    newRoom = newRoom.replace(/ /g, "-");
    if (!rooms.hasOwnProperty(newRoom)) {
        Room.create({
            name: newRoom,
            queue: []
        }, function(err, room) {
            if (err) {
                console.log(err);
                console.log("Couldn't create new room!");
            } else {
                console.log("Successfully created room " + newRoom + "!!");
            }
        });
        rooms[newRoom] = [];  
    } else {
        console.log("room exists");
    }
    res.redirect("/");
});

app.get("/destroyRoom/:roomName", function(req, res) {
    let roomName = req.params.roomName;
    
    console.log("roomName is: " + roomName);
    Room.deleteOne({name: roomName}, function(err, room) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully deleted " + roomName + "!!");
        }
    });
    
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
    console.log('A user connected!');
    
    socket.on('disconnect', function(){
        console.log('A user disconnected!');
    });
    
    socket.on('enqueue', function(roomNStudent){
        let roomName = Object.keys(roomNStudent)[0];
        let student = roomNStudent[roomName];
        student = student.replace(/\s+$/, '');
        
        io.emit('enqueue', student);
        
        Room.updateOne({
            name: roomName
        },
        {
            $push: {queue: student}
        }, function(err, room) {
            if (err) {
                console.log(err);
                console.log("Couldn't add new student!");
            } else {
                console.log("Successfully added " + student + " in: " + roomName);        
            }
        });
        
    });
        
    socket.on('dequeue', function(roomNStudent){
        let roomName = Object.keys(roomNStudent)[0];
        let student = roomNStudent[roomName];
        student = student.replace(/\s+$/, '');   // OK BUT WHY!!!
        
        io.emit('dequeue', student);
        
        Room.updateOne({
            name: roomName
        },
        {
            $pull: {queue: student}
        }, function(err, room) {
            if (err) {
                console.log(err);
                console.log("Failed to remove " + student + " in " + roomName);
            } else {
                console.log("Succeeded in removing " + student + " in " + roomName);      
            }
        });
        
    });
});

http.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server is listening!!!\nCheck https://q-totype-marshmallowsunshinecafe.c9users.io/");
});