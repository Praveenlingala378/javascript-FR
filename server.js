const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import TensorFlow.js for Node.js
require('@tensorflow/tfjs-node');

// Import canvas for Node.js environment
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;

// Import face-api.js
const faceapi = require('face-api.js');

// Patch the environment for Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory storage for face descriptors
let labeledFaceDescriptors = [];
let faceMatcher = null;

// Load models on server start
async function loadModels() {
    console.log('Loading face-api.js models...');
    
    const modelPath = path.join(__dirname, 'models');
    
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
        faceapi.nets.faceExpressionNet.loadFromDisk(modelPath)
    ]);
    
    console.log('✅ All models loaded successfully!');
}

// Helper function to create image from buffer
async function bufferToImage(buffer) {
    const img = new Image();
    img.src = buffer;
    return img;
}

// API Routes

// 1. Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Face Recognition API is running',
        modelsLoaded: {
            faceDetector: faceapi.nets.tinyFaceDetector.isLoaded,
            faceLandmarks: faceapi.nets.faceLandmark68Net.isLoaded,
            faceRecognition: faceapi.nets.faceRecognitionNet.isLoaded,
            faceExpression: faceapi.nets.faceExpressionNet.isLoaded
        },
        registeredFaces: labeledFaceDescriptors.length
    });
});

// 2. Detect faces in image
app.post('/api/detect', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const img = await bufferToImage(req.file.buffer);
        
        const detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        const results = detections.map((detection, index) => ({
            faceId: index,
            confidence: detection.detection.score,
            box: detection.detection.box,
            landmarks: detection.landmarks.positions.length,
            expressions: detection.expressions
        }));

        res.json({
            success: true,
            facesDetected: detections.length,
            faces: results
        });

    } catch (error) {
        console.error('Detection error:', error);
        res.status(500).json({ 
            error: 'Face detection failed', 
            details: error.message 
        });
    }
});

// 3. Train/Register a face
app.post('/api/train', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const img = await bufferToImage(req.file.buffer);
        
        const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return res.status(400).json({ error: 'No face detected in image' });
        }

        // Check if person already exists
        const existingPerson = labeledFaceDescriptors.find(person => person.label === name);
        
        if (existingPerson) {
            // Add another descriptor for the same person
            existingPerson.descriptors.push(detection.descriptor);
        } else {
            // Add new person
            labeledFaceDescriptors.push(
                new faceapi.LabeledFaceDescriptors(name, [detection.descriptor])
            );
        }

        // Update face matcher
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

        res.json({
            success: true,
            message: `Face registered for ${name}`,
            totalDescriptors: existingPerson ? existingPerson.descriptors.length : 1,
            totalPeople: labeledFaceDescriptors.length
        });

    } catch (error) {
        console.error('Training error:', error);
        res.status(500).json({ 
            error: 'Face training failed', 
            details: error.message 
        });
    }
});

// 4. Recognize faces in image
app.post('/api/recognize', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        if (!faceMatcher) {
            return res.status(400).json({ error: 'No faces have been trained yet' });
        }

        const img = await bufferToImage(req.file.buffer);
        
        const detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

        const results = detections.map((detection, index) => {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
            
            return {
                faceId: index,
                box: detection.detection.box,
                recognition: {
                    name: bestMatch.distance < 0.6 ? bestMatch.label : 'Unknown',
                    confidence: Math.round((1 - bestMatch.distance) * 100),
                    distance: bestMatch.distance,
                    isMatch: bestMatch.distance < 0.6
                }
            };
        });

        res.json({
            success: true,
            facesDetected: detections.length,
            faces: results
        });

    } catch (error) {
        console.error('Recognition error:', error);
        res.status(500).json({ 
            error: 'Face recognition failed', 
            details: error.message 
        });
    }
});

// 5. Get all registered faces
app.get('/api/faces', (req, res) => {
    const faces = labeledFaceDescriptors.map(person => ({
        name: person.label,
        descriptors: person.descriptors.length
    }));

    res.json({
        success: true,
        totalPeople: labeledFaceDescriptors.length,
        faces: faces
    });
});

// 6. Delete a registered face
app.delete('/api/faces/:name', (req, res) => {
    const { name } = req.params;
    
    const index = labeledFaceDescriptors.findIndex(person => person.label === name);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Person not found' });
    }

    labeledFaceDescriptors.splice(index, 1);
    
    // Update face matcher
    if (labeledFaceDescriptors.length > 0) {
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    } else {
        faceMatcher = null;
    }

    res.json({
        success: true,
        message: `${name} removed from face recognition`,
        remainingPeople: labeledFaceDescriptors.length
    });
});

// 7. Clear all registered faces
app.delete('/api/faces', (req, res) => {
    labeledFaceDescriptors = [];
    faceMatcher = null;

    res.json({
        success: true,
        message: 'All registered faces cleared'
    });
});

// Serve static files (for web interface)
app.use(express.static(__dirname));

// Start server
async function startServer() {
    try {
        await loadModels();
        
        app.listen(PORT, () => {
            console.log(`🚀 Face Recognition API Server running on http://localhost:${PORT}`);
            console.log(`📋 API Documentation available at http://localhost:${PORT}/api-docs.html`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();