console.log(localStorage.getItem('roomCode'))
if(localStorage.getItem('roomCode')!==null)
    window.location.href = 'game.html';
function createRoom() {
    const playerName = document.getElementById('playerName').value;

    fetch('https://redblack.onrender.com/createRoom', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: playerName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.action === 'created') {
            const roomCode = data.roomCode;
            const players = data.players;
            // Save room code and players list in localStorage
            localStorage.setItem('roomCode', roomCode);
            localStorage.setItem('players', data.players);
            localStorage.setItem('playerName', playerName);
            // Redirect to game.html
            window.location.href = 'game.html';
        } else {
            console.error('Error creating room:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function joinRoom() {
    const playerName = document.getElementById('playerName').value;
    const enteredCode = document.getElementById('joinCode').value;

    fetch(`https://redblack.onrender.com/joinRoom?roomCode=${enteredCode}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: playerName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.action === 'joined') {
            const roomCode = data.roomCode;
            const players = data.players;
            // Save room code and players list in localStorage
            localStorage.setItem('roomCode', roomCode);
            localStorage.setItem('players', JSON.stringify(players));
            localStorage.setItem('playerName', playerName);
            // Redirect to game.html
            window.location.href = 'game.html';
        } else {
            console.error('Error joining room:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
