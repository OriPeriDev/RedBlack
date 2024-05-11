// Connect to the server using Socket.IO
const socket = io('https://redblack.onrender.com');

// Retrieve room code from localStorage
const roomCode = localStorage.getItem('roomCode');
if(roomCode!==null){
    document.getElementById('roomCode').innerText = roomCode;
}
else{
    window.location.href = 'index.html';
}

// When the connection is established, join the appropriate room
const playerName = localStorage.getItem("playerName")
socket.on('connect', () => {
    socket.emit('joinRoom', { roomCode , playerName});
});
window.addEventListener('beforeunload', function (event) {
    // Clear local storage
    localStorage.clear();
});

function roll(){
    socket.emit('roll');
}

function disc(){
    socket.emit('disco');
    localStorage.clear();
    window.location.href = 'index.html';
}

function red(){
    const colorDisplayElement = document.getElementById("color");
    colorDisplayElement.innerText = `Your color: ${color}`;
    localStorage.setItem('color',color)
}
// Display room code and players list
const color1 = localStorage.getItem('color')
if(color1!==null){
    const colorDisplayElement = document.getElementById("color");
    colorDisplayElement.innerText = `Your color: ${color1}`;
}



const playerListElement = document.getElementById('playerList');
try{
    const players = JSON.parse(localStorage.getItem('players'));
    if (typeof players === 'object') {
        players.forEach(player => {
            const listItem = document.createElement('li');
            listItem.innerText = player;
            playerListElement.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement('li');
        listItem.innerText = players;
        playerListElement.appendChild(listItem);
    }
}
catch{
    const players = localStorage.getItem('players');
    const listItem = document.createElement('li');
        listItem.innerText = players;
        playerListElement.appendChild(listItem);
    
}



// Listen for room updates and update the player list
socket.on('roomUpdated', (data) => {
    if (data.roomCode === roomCode) {
        // Update the players list in localStorage
        localStorage.setItem('players', JSON.stringify(data.players));

        // Update the players list on the page
        const playerListElement = document.getElementById('playerList');
        playerListElement.innerHTML = '';
        data.players.forEach(player => {
            const listItem = document.createElement('li');
            listItem.innerText = player;
            playerListElement.appendChild(listItem);
        });
        const btn = document.getElementById('btn')
        if(Object.keys(players).length>3){
            btn.style.display = "block";
        }
    }
});

socket.on('colorAssigned', ({ player, color }) => {
    // Check if the assigned color is for the current player
    const currentPlayerName = localStorage.getItem('playerName');
    if (player === currentPlayerName) {
        // Display the assigned color on the screen
        const colorDisplayElement = document.getElementById("color");
        colorDisplayElement.innerText = `Your color: ${color}`;
        localStorage.setItem('color',color)
    }
});