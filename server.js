const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const server = http.createServer(app);
const io = socketio(server);
//set static folder
app.use(express.static(path.join(__dirname, "public")));

io.on('connection', socket => {
    socket.on("joinRoom", ({ username, room }) => {
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

//app.post("/data",(req,res)=>{
 //   console.log(req.body);
//})

server.listen( process.env.PORT || 3000, () => {
    console.log("app is listening on 5000 ");
})