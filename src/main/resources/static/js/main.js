'use strict';

const usernamePage = document.querySelector('#username-page');
const usernameForm = document.querySelector('#usernameForm');

const chatPage = document.querySelector('#chat-page');
const connectingElement = document.querySelector('.connecting');
const messageArea = document.querySelector('#messageArea');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');

let stompClient = null;
let username = null;

const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];



function connect(event) {
    username = document.querySelector('#name').value.trim();

    if (username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        // perform connection
        stompClient.connect({}, onConnected, onError);
    }

    event.preventDefault();
}



function onConnected() {
    // subscribe to public topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // tell username to server
    stompClient.send(
        '/app/chat.addUser',
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );

    connectingElement.classList.add('hidden');
}



function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket Server. Please refresh this page and try again!';
    connectingElement.style.color = 'red';
}



function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);

    const messageElement = document.createElement('li');

    if (message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';

    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';

    } else {
        messageElement.classList.add('chat-message');

        const avatarElement = document.createElement('i');
        const avatarText = document.createTextNode(message.sender[0]);

        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        const usernameElement = document.createElement('span');
        const usernameText = document.createTextNode(message.sender);

        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    const textElement = document.createElement('p');
    const messageText = document.createTextNode(message.content);

    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}



function getAvatarColor(messageSender) {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
}



function sendMessage(event) {
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        const chatMessage = {
            content: messageContent,
            sender: username,
            type: 'CHAT'
        };

        stompClient.send(
            '/app/chat.sendMessage',
            {},
            JSON.stringify(chatMessage)
        );

        messageInput.value = '';
    }

    event.preventDefault();
}



usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);