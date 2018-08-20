var mongoose = require("mongoose");

var roomSchema = new mongoose.Schema({
    name: String,
    queue: [String] 
});

var Room = mongoose.model("Room", roomSchema);

module.exports = Room;