let video;
let faceMatcher = null;
let labeledFaceDescriptors = [];
let isTrainingMode = false;
let currentPersonName = '';

// Add status message function
function addStatusMessage(message, type = 'info') {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    const videoElement = document.getElementById('video');
    if (videoElement) {
        document.body.insertBefore(statusDiv, videoElement);
    } else {
        document.body.appendChild(statusDiv);
    }
}

// Face recognition functions
function startTraining(personName) {
    if (!personName.trim()) {
        alert('Please enter a person name!');
        return;
    }
    
    isTrainingMode = true;
    currentPersonName = personName.trim();
    addStatusMessage(`Training mode: Look at camera to register "${currentPersonName}"`, 'warning');
    
    // Auto-stop training after 3 seconds
    setTimeout(() => {
        stopTraining();
    }, 3000);
}

function stopTraining() {
    isTrainingMode = false;
    currentPersonName = '';
    addStatusMessage('Training stopped. Recognition mode active.', 'success');
}

function clearAllFaces() {
    labeledFaceDescriptors = [];
    faceMatcher = null;
    addStatusMessage('All registered faces cleared.', 'warning');
}

function addKnownFace(faceDescriptor, label) {
    // Check if person already exists
    const existingPerson = labeledFaceDescriptors.find(person => person.label === label);
    
    if (existingPerson) {
        // Add another descriptor for the same person (improves accuracy)
        existingPerson.descriptors.push(faceDescriptor);
        console.log(`Added another descriptor for ${label}. Total: ${existingPerson.descriptors.length}`);
    } else {
        // Add new person
        labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, [faceDescriptor]));
        console.log(`Added new person: ${label}`);
    }
    
    // Update face matcher
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    addStatusMessage(`Registered "${label}" for face recognition!`, 'success');
}

// Initialize when script loads (face-api.js is already loaded by this point)
console.log('Script loaded, initializing...');
video = document.getElementById('video');

if (!video) {
    console.error('Video element not found!');
    addStatusMessage('Error: Video element not found!', 'error');
} else if (typeof faceapi === 'undefined') {
    console.error('face-api.js not loaded!');
    addStatusMessage('Error: face-api.js library not loaded!', 'error');
} else {
    console.log('face-api.js loaded successfully, starting initialization...');
    initializeModels();
}

function initializeModels() {
    // Add initial loading message
    addStatusMessage('Loading face detection models...', 'warning');
    
    console.log('Starting model loading...');
    console.log('Available models:', Object.keys(faceapi.nets));

    // Load all models - you now have complete model files!
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
    ]).then(() => {
        console.log('🎉 ALL models loaded successfully!');
        addStatusMessage('🎉 All models loaded! Face recognition ready.', 'success');
        
        // Log which models are loaded
        console.log('Loaded models:');
        console.log('- Face Detection:', faceapi.nets.tinyFaceDetector.isLoaded);
        console.log('- Face Landmarks:', faceapi.nets.faceLandmark68Net.isLoaded);
        console.log('- Face Recognition:', faceapi.nets.faceRecognitionNet.isLoaded);
        console.log('- Face Expressions:', faceapi.nets.faceExpressionNet.isLoaded);
        
        startVideo();
    }).catch(err => {
        console.error('Error loading models:', err);
        addStatusMessage('Error loading models. Check console for details.', 'error');
        console.error('Detailed error:', err);
    });
}

function startVideo() {
    addStatusMessage('Requesting camera access...', 'warning');
    
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            console.log('Camera access granted');
            addStatusMessage('Camera access granted! Starting face detection...', 'success');
            
            // Set up the video play event listener
            video.addEventListener('play', onVideoPlay);
        })
        .catch(err => {
            console.error('Camera access error:', err);
            addStatusMessage('Camera access denied or not available. Please allow camera access and refresh the page.', 'error');
        });
}

function onVideoPlay() {
    console.log('Video started playing, setting up face detection...');
    
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    addStatusMessage('Face detection active! Use controls below for face recognition.', 'success');

    setInterval(async () => {
        try {
            // Get detections with face descriptors for recognition
            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw basic detection results
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            // Handle face recognition
            resizedDetections.forEach((detection, i) => {
                const { descriptor } = detection;
                
                if (isTrainingMode && currentPersonName) {
                    // Training mode: register this face
                    addKnownFace(descriptor, currentPersonName);
                } else if (faceMatcher) {
                    // Recognition mode: identify this face
                    const bestMatch = faceMatcher.findBestMatch(descriptor);
                    
                    // Draw recognition result
                    const box = detection.detection.box;
                    const label = bestMatch.distance < 0.6 ? 
                        `${bestMatch.label} (${Math.round((1 - bestMatch.distance) * 100)}%)` : 
                        'Unknown';
                    
                    // Draw name label above the face
                    ctx.fillStyle = bestMatch.distance < 0.6 ? '#00ff00' : '#ff0000';
                    ctx.font = '16px Arial';
                    ctx.fillText(label, box.x, box.y - 10);
                }
            });

        } catch (error) {
            console.error('Error during face detection:', error);
        }
    }, 100);
}

// Make functions available globally for HTML buttons
window.startTraining = startTraining;
window.stopTraining = stopTraining;
window.clearAllFaces = clearAllFaces;