const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gpsData = { lat: 0, lng: 0, sats: 0 };

// Endpoint for ESP32 to send data
app.get('/update_location', (req, res) => {
    const { lat, lng, sats } = req.query;
    if (lat && lng && sats) {
        gpsData = { 
            lat: parseFloat(lat), 
            lng: parseFloat(lng), 
            sats: parseInt(sats) 
        };
        // Broadcast the new data to all connected clients
        io.emit('gps-update', gpsData);
        res.send('Location received');
    } else {
        res.status(400).send('Invalid data');
    }
});

// Serve the HTML file
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');
    // Send the last known location to the new client
    socket.emit('gps-update', gpsData);
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});