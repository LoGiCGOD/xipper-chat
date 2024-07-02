require('dotenv').config();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chatapp');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const User = require('./models/userModel');
const Chat = require('./models/chatModel');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

const userRoute = require('./routes/userRoutes'); //import router from routes folder
app.use('/', userRoute);

var usp = io.of('/user-namespace');  //user namespace

usp.on('connection', async function(socket) {
    console.log("User Connected");
    console.log(socket.handshake.auth.token);
    var userID = socket.handshake.auth.token;

    await User.findByIdAndUpdate({ _id: userID }, { $set: { is_online: '1' } }); //changing the status from offline to online

    // Broadcast userID of online user to other users
    socket.broadcast.emit('getOnlineUser', { user_id: userID });

    socket.on('disconnect', async function() {
        console.log('User Disconnected');
        await User.findByIdAndUpdate({ _id: userID }, { $set: { is_online: '0' } });

        // Broadcast userID of offline user to other users
        socket.broadcast.emit('getOfflineUser', { user_id: userID });
    });

    // Chat implementation - send message to other side
    socket.on('newChat', function(data){
        socket.broadcast.emit('loadNewChat', data);
    });

    socket.on('existsChat', async function(data){
        var chats = await Chat.find({
            $or:[
                { sender_id: data.sender_id, receiver_id: data.receiver_id },
                { sender_id: data.receiver_id, receiver_id: data.sender_id }
            ]
        }).sort({ createdAt: 1 });  // Sorting chats by creation time
        socket.emit('loadChats', { chats: chats });
    });
});



const port = 3000;
http.listen(port, function() {
    console.log(`Server is running on port ${port}`);
});
