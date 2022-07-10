const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const server = http.createServer(app);
const io = socketio(server);
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
const chatPage=path.join(__dirname,"./public/chat.html")
// parse application/json
app.use(bodyParser.json())

//set static folder
app.use(express.static(path.join(__dirname, "public")));
let username;
let room;
app.post("/",(req,res)=>{
    console.log(req.body);
    username=req.body.username;
    room=req.body.room;
    if(req.body.password=="1234567"){
       res.sendFile(chatPage);
    }
 })
io.on('connection', socket => {
    
        const user = userJoin(socket.id, username, room);
        //join the room
        socket.join(user.room)
        //welcome current user
        socket.emit("message", formatMessage("chatCord Bot", "Welcome to chatCord"));
        //all will know except the user
        socket.broadcast.to(user.room).emit("message", formatMessage("chatCord Bot", `${username} has joined the chat`))

        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    //receiving message from chat
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message",formatMessage(`${user.username}`, msg))
    })
    //runs when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit("message", formatMessage("chatCord Bot", `${user.username} has left the chat`));

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
        })
    };
});
});



server.listen( process.env.PORT || 3000, () => {
    console.log("app is listening on 3000 ");
})