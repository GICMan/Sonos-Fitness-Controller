
//sets up express and socket.io
var express = require('express');
var app = express();
var server = app.listen(8080, function(){
    console.log("listening on port 8080");
});
var io = require('socket.io').listen(server);

//requires 'http'
var http = require('http');

//key for code to room name
var codes = {
    a1: "room 1",
    b2: "room 2",
    c3: "room 3",
    d4: "back yard"
};

//sends index.html
app.get('/', function(req, res){
    res.sendFile(__dirname + "/index.html"); 
});


//when a user has connected
io.on('connection', function(socket){   

    //check for valid room code and send back response to socket
    socket.on("roomCode", function(code, callback){
        if(codes.hasOwnProperty(code)){
            socket.roomName = codes[code];
            callback(true);
        }else{
            callback(false);
        }
    });

    socket.on('getPlaylists', function(){
        speakerControl('back yard', 'playlists', 1, function(data){
            io.emit('playlists', data);
        });
    });

    //pushes events from sockets to the node sonos http api
    socket.on("pause", function(){
        speakerControl(socket.roomName, "pause", 1);
    });
    socket.on("play", function(){
        speakerControl(socket.roomName, "play", 1);
    });
    socket.on("next", function(){
        speakerControl(socket.roomName, "next", 1);
    });
    socket.on("prev", function(){
        speakerControl(socket.roomName, "previous", 1);
    });
    socket.on("select", function(playlist){
        speakerControl(socket.roomName, "playlist", playlist);
    });
});

//controls the api
function speakerControl(speaker, param, value, callback){

    //creats a string to send
    action = "http://localhost:5005/" + speaker + "/" + param + "/" + value.toString();

    //gets response
    http.get(action, function(res){
        let data = '';
        res.on('data', function(chunk){
            data += chunk;
        });

        res.on('end', function(){
            if(callback != null){
                callback(JSON.parse(data));
            }      
        })
    }).on("error", function(){
        console.log("Error: " + err.message); 
    });
}


//temp
function update(){
    speakerControl("back yard", "state", 1, function(emitData){
        io.emit('update', emitData);
    });
}
