const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store rooms and their players
const rooms = {};

// Handle POST request to create a room
app.post('/createRoom', (req, res) => {
    const { name } = req.body; // Player's name
    const roomCode = generateRoomCode();
    rooms[roomCode] = [name]; // Store the player's name in the room
    const responseData = { action: 'created', roomCode, players: rooms[roomCode] };

    // Emit the room created event
    connect(roomCode)
    io.to(roomCode).emit('roomUpdated', { action: 'joined', roomCode, players: rooms[roomCode] });

    res.json(responseData);
});

function connect(roomCode) {
    io.on('connection', (socket) => {
        // Handle joinRoom event
        socket.on('joinRoom', ({ roomCode , playerName}) => {
            // Join the room
            socket.join(roomCode);
            // Store the room code and player name in the socket object
            socket.roomCode = roomCode;
            socket.playerName = playerName;
        });
        socket.on('roll', () => {
            if (rooms[roomCode]) {
                const players = rooms[roomCode];
                var red1 = Math.floor(Math.random() * (Object.keys(rooms[roomCode]).length))
                var red2 = Math.floor(Math.random() * (Object.keys(rooms[roomCode]).length))

                if (Object.keys(rooms[roomCode]).length > 1) {
                    while (red2 === red1) {
                        red2 = Math.floor(Math.random() * (Object.keys(rooms[roomCode]).length))
                    }
                }
                var i = 0
                players.forEach(player => {
                    var color = "black"
                    if (i == red1 || i == red2)
                        color = "red"
                    // Emit 'colorAssigned' event to the specific player
                    const responseData = { player, color }
                    io.to(roomCode).emit('colorAssigned', responseData);
                    i++;
                });
            }
        });

        // Handle player disconnection
        socket.on('disco', () => {
            socket.disconnect();
        });
        socket.on('disconnect', () => {
            // Retrieve the room code and player name from the socket object
            const roomCode = socket.roomCode;
            const playerName = socket.playerName;
            if (roomCode && rooms[roomCode]) {
                // Find the player's name
                const playerIndex = rooms[roomCode].indexOf(playerName);
                if (playerIndex !== -1) {
                    // Remove the disconnected player from the room
                    rooms[roomCode].splice(playerIndex, 1);
                    // If there's no player left, delete the room
                    if (rooms[roomCode].length === 0) {
                        delete rooms[roomCode];
                    } else {
                        // Emit updated player list to all players in the room
                        io.to(roomCode).emit('roomUpdated', { action: 'disconnected', roomCode, players: rooms[roomCode] });
                    }
                }
            }
        });

    });
}

// Handle POST request to join a room
app.post('/joinRoom', (req, res) => {

    const { name } = req.body; // Player's name
    const roomCode = req.query.roomCode;
    if (rooms[roomCode]) {
        rooms[roomCode].push(name); // Add the player's name to the room
        const players = rooms[roomCode]; // Get the list of players

        // Emit the room updated event to all clients in the room
        connect(roomCode)
        io.to(roomCode).emit('roomUpdated', { action: 'joined', roomCode, players });

        res.json({ action: 'joined', roomCode, players });
    } else {
        res.status(404).json({ action: 'error', message: 'Room not found.' });
    }
});




// Generate a room code
function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Start the server
const port = 8000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
