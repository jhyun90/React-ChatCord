const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages'); // class
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(username, room);

// Be able to have access to io because of the script tag we've added in 'chat.html'
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// How to catch the message sent from a server on the client side
socket.on('message', message => {
    // Run whenever we get this 'message' event
    // message as a parameter equals to the message inside the socket.emit() from the server side
    console.log(message);

    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Submit message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get message text
    const msg = e.target.elements.msg.value;
    // msg equals to 'id' of input message

    console.log(msg);

    // Emit a message to the server 
    socket.emit('chatMessage', msg);

    // Clear input text
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');

    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    
    document.querySelector('.chat-messages').appendChild(div);
};

// Add chat room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
};

// Add a list of participants to DOM
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
};
