var express = require('express')
var session = require('express-session')({
              secret: 'chatroom',
              resave: true,
              saveUninitialized: true
            })
var io_session = require('express-socket.io-session')
var path = require('path')
var app = express()
app.use(express.static(path.join(__dirname, './static')))
app.use(session)

app.get('/', (request, response) => {
  response.render('index.html')
})


var server = app.listen(8000)
var io = require('socket.io').listen(server)
io.use(io_session(session))
var count = 0
var users = {}
io.sockets.on('connection', function (socket) {
  socket.on('join_chat', function (data) { //2
    // count += 1
    // socket.handshake.session.user_id = count
    // socket.handshake.session.save()
    users[socket.id] = data.user
    socket.broadcast.emit('new_user', {user: data.user, id: socket.id}) //3.1 - we are showing new user that was just added
    socket.emit('all_users', {all_users: users}) //3.2 - we are showing all existing users to the user that just logged in
  })
  socket.on('remove_user', function (data) { //7
    var temp = data.user_id
    delete users[data.user_id]

    socket.broadcast.emit('update', {user_id: temp}) //8
  })

})
