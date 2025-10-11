const map = L.map('map').setView([6.9271, 79.8612], 8); // Initial view (Colombo)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let marker = L.marker([0, 0]).addTo(map);
const satsCountElement = document.getElementById('sats-count');
const signalStrengthElement = document.getElementById('signal-strength');
const gpsAccuracyElement = document.getElementById('gps-accuracy');
const statusContainer = document.getElementById('status-container');

// Satellite visualization elements
const satellitesContainer = document.querySelector('.satellites-container');
const orbitalPathsContainer = document.querySelector('.orbital-paths');
const connectionLinesContainer = document.querySelector('.connection-lines');

// Satellite system state
let satellites = [];
let orbitalPaths = [];
let connectionLines = [];
let isConnected = false;

const socket = io();

// Initialize satellite visualization
function initializeSatellites() {
    // Create orbital paths
    for (let i = 0; i < 3; i++) {
        const path = document.createElement('div');
        path.className = 'orbital-path';
        const radius = 120 + (i * 30);
        path.style.width = `${radius * 2}px`;
        path.style.height = `${radius * 2}px`;
        path.style.top = `50%`;
        path.style.left = `50%`;
        path.style.transform = 'translate(-50%, -50%)';
        path.style.animationDelay = `${i * 0.5}s`;
        orbitalPathsContainer.appendChild(path);
        orbitalPaths.push(path);
    }

    // Create satellites
    for (let i = 0; i < 8; i++) {
        const satellite = document.createElement('div');
        satellite.className = 'satellite';
        satellite.style.animationDelay = `${i * 1}s`;
        satellite.style.animationDuration = `${8 + (i % 3) * 2}s`;
        satellitesContainer.appendChild(satellite);
        satellites.push(satellite);
    }
}

// Update satellite connections based on GPS data
function updateSatelliteConnections(satCount) {
    // Clear existing connection lines
    connectionLinesContainer.innerHTML = '';
    connectionLines = [];

    if (satCount > 0) {
        // Create connection lines from satellites to Earth
        for (let i = 0; i < Math.min(satCount, satellites.length); i++) {
            const line = document.createElement('div');
            line.className = 'connection-line';
            
            // Calculate line position and angle
            const angle = (i * 45) * (Math.PI / 180);
            const startX = 50 + Math.cos(angle) * 30;
            const startY = 50 + Math.sin(angle) * 30;
            const endX = 50 + Math.cos(angle) * 80;
            const endY = 50 + Math.sin(angle) * 80;
            
            const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const rotation = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
            
            line.style.width = `${length}%`;
            line.style.left = `${startX}%`;
            line.style.top = `${startY}%`;
            line.style.transform = `rotate(${rotation}deg)`;
            line.style.animationDelay = `${i * 0.2}s`;
            
            connectionLinesContainer.appendChild(line);
            connectionLines.push(line);
        }
    }
}

// Update status indicators
function updateStatusIndicators(sats) {
    if (sats >= 4) {
        signalStrengthElement.textContent = 'Strong';
        gpsAccuracyElement.textContent = 'Excellent';
        statusContainer.classList.add('connected');
        isConnected = true;
    } else if (sats >= 2) {
        signalStrengthElement.textContent = 'Moderate';
        gpsAccuracyElement.textContent = 'Good';
        statusContainer.classList.remove('connected');
        isConnected = false;
    } else {
        signalStrengthElement.textContent = 'Weak';
        gpsAccuracyElement.textContent = 'Poor';
        statusContainer.classList.remove('connected');
        isConnected = false;
    }
}

// Initialize the visualization
initializeSatellites();

socket.on('gps-update', (data) => {
    console.log('Received data:', data);
    const { lat, lng, sats } = data;

    satsCountElement.textContent = sats;

    // Update map only if location is valid
    if (lat !== 0 && lng !== 0) {
        const newLatLng = new L.LatLng(lat, lng);
        marker.setLatLng(newLatLng);
        map.setView(newLatLng, 15); // Auto-center the map
    }

    // Update satellite visualization
    updateSatelliteConnections(sats);
    updateStatusIndicators(sats);
});