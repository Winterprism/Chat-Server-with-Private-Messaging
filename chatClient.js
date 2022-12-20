//connect to server and retain the socket
//connect to same host that served the document
const socket = io('http://' + window.document.location.host)

socket.on('serverSays', function(message) {
  let msgDiv = document.createElement('div')
  console.log("testZ")
  msgDiv.textContent = message
 
  document.getElementById('messages').appendChild(msgDiv)
})

socket.on('user-connected', name => {
  sendmessage(`${name} connected`)
 
})

socket.on('chat-message', data => {
  console.log("testA")
  sendmessage(`${data.name}: ${data.message}`)
  
})

socket.on('private-chat-message', data => {
  console.log("testA1")
  privateMessage(`${data.name}: ${data.message}`)
  
})

socket.on('User-chat-message', data => {
  console.log("testA2")
  sendMessageUser(`${data.name}: ${data.message}`)
})

socket.on('Private-user-chat-message', data => {
  console.log("testA3")
  privateMessage(`${data.name}: ${data.message}`)

  
})



function sendmessage(message) {
  console.log("testB")
  const messageElement = document.createElement('div')
  messageElement.textContent = message
  document.getElementById('messages').append(messageElement)
}

function sendMessageUser(message) {
  console.log("testB2")
  const messageElement = document.createElement('div')
  messageElement.style.color = "blue";
  messageElement.textContent = message
  document.getElementById('messages').append(messageElement)
}

function privateMessage(message) {
  console.log("testB")
  const messageElement = document.createElement('div')
  messageElement.style.color = "red";
  messageElement.textContent = message
  document.getElementById('messages').append(messageElement)
}

function sendMessage() {
  console.log("testC")
  let message = document.getElementById('msgBox').value.trim()
  

  if (message.indexOf(':') !== -1) {
    
    var privateMessageName = message.split(':')[0];
    var privateMessage = message.split(':')[1];
  
    //send your message onto your chat
    //socket.emit('private-user-message', privateMessage)
    socket.emit('user-message', privateMessage)

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

      //privateMessageName.split(",").length
      console.log(privateMessageName.split(",").length)
      console.log(privateMessageName.replace(/ /g, '').split(","))
      console.log("testsplit")
    }


  }else{
    

    linebreak = document.createElement("br");
    document.getElementById('messages').append(linebreak)



    //send your message onto your chat
    socket.emit('user-message', message)
    //send your message to the others
    socket.emit('send-chat-message', message)

    document.getElementById('msgBox').value = ''
    console.log("testF")
  }
  console.log("testG")
  
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
    console.log('hellllo')
  }
  
  
  console.log('hellllo2')
}

function clear() {
  document.getElementById('messages').textContent = "";
  document.getElementById('messages').setAttribute('style', '');
  console.log('hellllo')
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

// document.getElementById('send-container').addEventListener('submit', e => {
//   e.preventDefault()
//   console.log('hetttt')
//   const message = messageInput.value
//   sendMessage(`You: ${message}`)
//   socket.emit('send-chat-message', message)
//   messageInput.value = ''
// })

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
