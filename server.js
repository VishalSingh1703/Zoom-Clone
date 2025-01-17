const express = require('express')
const app = express();
const server = require('http').Server(app);
const { v4 : uuid4 } = require('uuid');
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuid4()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId : req.params.room});
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log("joined room", roomId);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);
        })
    })
})

server.listen(3030, () => {
    console.log('Server is running on port 3030');
});
