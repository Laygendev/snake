var KEY_ESC = 27;
var KEY_CHAT = 13;

function ChatClient(config) {
    this.commands = {};
    var input = document.getElementById('chatInput');
    input.addEventListener('keypress', this.sendChat.bind(this));
    input.addEventListener('keyup', function(key) {
        input = document.getElementById('chatInput');

        key = key.which || key.keyCode;
        if (key === KEY_ESC) {
            input.value = '';
            c.focus();
        }
    });
}

// Chat box implementation for the users.
ChatClient.prototype.addChatLine = function (name, message, me) {
    var newline = document.createElement('li');

    // Colours the chat input correctly.
    newline.className = (me) ? 'me' : 'friend';
    newline.innerHTML = '<b>' + ((name.length < 1) ? 'Un serpent ' : name) + '</b>: ' + message;

    this.appendMessage(newline);
};


// Chat box implementation for the system.
ChatClient.prototype.addSystemLine = function (message) {
    var newline = document.createElement('li');

    // Colours the chat input correctly.
    newline.className = 'system';
    newline.innerHTML = message;

    // Append messages to the logs.
    this.appendMessage(newline);
};

// Places the message DOM node into the chat box.
ChatClient.prototype.appendMessage = function (node) {
    var chatList = document.getElementById('chatList');
    if (chatList.childNodes.length > 10) {
        chatList.removeChild(chatList.childNodes[0]);
    }
    chatList.appendChild(node);
};

// Sends a message or executes a command on the click of enter.
ChatClient.prototype.sendChat = function (key) {
    var commands = this.commands,
        input = document.getElementById('chatInput');

    key = key.which || key.keyCode;

    if (key === KEY_ENTER) {
        var text = input.value.replace(/(<([^>]+)>)/ig,'');
        if (text !== '') {
            socket.emit('playerChat', { sender: player.name, message: text });
            this.addChatLine(player.name, text, true);

            // Resets input.
            input.value = '';
            c.focus();
        }
    }
};

// Allows for addition of commands.
ChatClient.prototype.registerCommand = function (name, description, callback) {
    this.commands[name] = {
        description: description,
        callback: callback
    };
};

// Allows help to print the list of all the commands and their descriptions.
ChatClient.prototype.printHelp = function () {
    var commands = this.commands;
    for (var cmd in commands) {
        if (commands.hasOwnProperty(cmd)) {
            this.addSystemLine('-' + cmd + ': ' + commands[cmd].description);
        }
    }
};

var chat = new ChatClient();
