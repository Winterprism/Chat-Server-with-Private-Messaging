const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.env.PORT || 3000 //useful if you want to specify port through environment variable

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

//object list fpr users
const userList ={}

//adds new user to user list
function addUser(userName, id){
  if (!Object.values(userList).includes(userName)){
    userList[id] = userName
    console.log(userList)
  }
}

//Socket Server
io.on('connection', function(socket) {
  socket.emit('serverSays', 'You are connected to CHAT SERVER')
  
  //sends message to room
  socket.on('send-chat-message', message => {

    socket.to("main-room").emit('chat-message', { message: message, name: userList[socket.id] })

  })

  //sends private message
  socket.on('send-private-message',function(data) {
    var socketID = Object.keys(userList).find(key => userList[key] === data.name);

    io.to(socketID).emit('private-chat-message',{message: data.message, name: userList[socket.id]});

  })

  //shows a message you sent on your screen
  socket.on('user-message', function(data)  {
    
    socket.emit('User-chat-message',{message: data, name: userList[socket.id]});

  })

  //shows a private message you sent on your screen
  socket.on('private-user-message', function(data)  {
    
    socket.emit('private-chat-message',{message: data, name: userList[socket.id]});

  })

  //When a new user created and joins room
  socket.on('new-user', name => {
    addUser(name, socket.id);
    socket.join("main-room");
    socket.to("main-room").emit('user-connected', name)
  })

})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:3000/chatClient.html`)
