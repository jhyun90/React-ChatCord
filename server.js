const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const formatMessage = require('./utils/messages')
const { 
    userJoin, 
    getCurrentUser, 
    userLeave, 
    getRoomUsers 
} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Set 'public' folder as static folder to access 'index.html' and 'chat.html' page
// Put username in 'index.html' page to take us right to 'chat.html' page that's being used as an action
app.use(express.static(path.join(__dirname, 'public')));

const botNmae = 'ChatCordBot';

// Running when a client connnects
// io.on(): Listen for some kind of event
io.on('connection', socket => {
    console.log('WebSocket connection established!');

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        /* 1) Emit to the single client that's connecting */
        socket.emit('message', formatMessage(botNmae, 'Welcome to CharCord!'));

        /* 2) Broadcast when a clinet connects */
        // Emit to everybody except the user that's connecting
        // Don't need to notify the user that's connecting that they're connecting
        socket.broadcast
            .to(user.room) // to a specific room
            .emit('message', formatMessage(botNmae, `${user.username} has joined the chat`));

        /* 3) Send the information about a room and a list of all the participants in the room */
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        console.log(msg);

        const user = getCurrentUser(socket.id)
        
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Run when a clinet disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            // Emit to all the clinets
            io.to(user.room).emit('message', formatMessage(botNmae, `${user.username} has left the chat`));

            // Send the information about a room and a list of all the participants in the room
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

// environment variable name 'PORT'
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
