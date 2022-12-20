//connect to server and retain the socket
//connect to same host that served the document
const socket = io('http://' + window.document.location.host)

socket.on('serverSays', function(message) {
  let msgDiv = document.createElement('div')

  msgDiv.textContent = message
 
  document.getElementById('messages').appendChild(msgDiv)
})

//when user connects
socket.on('user-connected', name => {
  sendmessage(`${name} connected`)
 
})

//sends message to others in room
socket.on('chat-message', data => {

  sendmessage(`${data.name}: ${data.message}`)
  
})

//sends private chat message
socket.on('private-chat-message', data => {

  privateMessage(`${data.name}: ${data.message}`)
  
})

//shows a message you sent on your screen
socket.on('User-chat-message', data => {

  sendMessageUser(`${data.name}: ${data.message}`)
})



function sendmessage(message) {
  const messageElement = document.createElement('div')
  messageElement.textContent = message
  document.getElementById('messages').append(messageElement)
}

function sendMessageUser(message) {
  const messageElement = document.createElement('div')
  messageElement.style.color = "blue";
  messageElement.textContent = message
  document.getElementById('messages').append(messageElement)
}

function privateMessage(message) {
  const messageElement2 = document.createElement('div')
  messageElement2.style.color = "red";
  messageElement2.textContent = message
  document.getElementById('messages').append(messageElement2)
}

function sendMessage() {
  let message = document.getElementById('msgBox').value.trim()
  
  if (message.indexOf(':') !== -1) {
    var privateMessageName = message.split(':')[0];
    var privateMessage = message.split(':')[1];
  
    //send your message onto your chat
    socket.emit('private-user-message', privateMessage)

    //send private message to listed user
    socket.emit('send-private-message', {name: privateMessageName, message: privateMessage})
    console.log("testE")

    //need to split again for "," 
    if (privateMessageName.indexOf(',') !== -1){
      let privateNameNum = privateMessageName.split(",").length;
      let privateNames = privateMessageName.replace(/ /g, '').split(",");
      console.log("testE2")

      //send private message to all listed users
      for (let i = 0; i < privateNameNum; i++) {
        socket.emit('send-private-message', {name: privateNames[i], message: privateMessage})

      }
    }
  }else{
    
    linebreak = document.createElement("br");
    document.getElementById('messages').append(linebreak)

    //send your message onto your chat
    socket.emit('user-message', message)
    //send your message to the others
    socket.emit('send-chat-message', message)

    document.getElementById('msgBox').value = ''
  }
  
}



function addUser() {
  let UserName = document.getElementById('userBox').value.trim()

  if(UserName.match(' ')){
    alert('space found in username!');
    document.getElementById("userBox").disabled = true;
    document.getElementById('user_button').disabled = true;
    document.getElementById('send_button').disabled = true;
  }else{
    checkUserConnected();
    socket.emit('new-user', UserName)
  }
  
}

function clear() {
  document.getElementById('messages').textContent = "";
  document.getElementById('messages').setAttribute('style', '');
}

function checkUserConnected() {
  if(document.getElementById('userBox').value != ""){

    document.getElementById("messages").disabled = false;

    document.getElementById('msgBox').disabled = false;
    document.getElementById('send_button').disabled = false;
  }
  else{
    
    document.getElementById('msgBox').disabled = true;
    document.getElementById('send_button').disabled = true;
  }
    

}

function handleKeyDown(event) {
  const ENTER_KEY = 13 //keycode for enter key
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  //This function is called after the browser has loaded the web page

  //add listener to buttons
  document.getElementById('send_button').addEventListener('click', sendMessage)

  document.getElementById('user_button').addEventListener('click', addUser)

  document.getElementById('clear_button').addEventListener('click', clear)


  //add keyboard handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  
})
