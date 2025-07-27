const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

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

// In-memory storage for face data
let faceDatabase = [];
let nextFaceId = 1;

// Simulate face detection and recognition (for demo purposes)
// In a real implementation, this would use actual ML models
function simulateFaceDetection(imageBuffer) {
    // Simulate detecting 1-3 faces with random positions
    const numFaces = Math.floor(Math.random() * 3) + 1;
    const faces = [];
    
    for (let i = 0; i < numFaces; i++) {
        faces.push({
            faceId: i,
            confidence: 0.85 + Math.random() * 0.14, // 0.85-0.99
            box: {
                x: Math.floor(Math.random() * 200),
                y: Math.floor(Math.random() * 200),
                width: 100 + Math.floor(Math.random() * 100),
                height: 120 + Math.floor(Math.random() * 100)
            },
            landmarks: 68,
            expressions: {
                happy: Math.random(),
                sad: Math.random() * 0.3,
                angry: Math.random() * 0.2,
                surprised: Math.random() * 0.4,
                neutral: Math.random() * 0.6
            }
        });
    }
    
    return faces;
}

function simulateFaceDescriptor() {
    // Generate a random 128-dimensional face descriptor
    return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
}

function calculateSimilarity(desc1, desc2) {
    // Calculate euclidean distance between descriptors
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum);
}

// API Routes

// 1. Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Simple Face Recognition API is running',
        version: 'Simple Demo Version',
        registeredFaces: faceDatabase.length,
        note: 'This is a simplified demo API without actual ML models'
    });
});

// 2. Detect faces in image
app.post('/api/detect', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Process image with Jimp to validate it's a real image
        const image = await Jimp.read(req.file.buffer);
        const imageInfo = {
            width: image.getWidth(),
            height: image.getHeight(),
            format: req.file.mimetype
        };

        // Simulate face detection
        const faces = simulateFaceDetection(req.file.buffer);

        res.json({
            success: true,
            message: 'Face detection completed (simulated)',
            imageInfo: imageInfo,
            facesDetected: faces.length,
            faces: faces
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

        // Process image
        const image = await Jimp.read(req.file.buffer);
        
        // Simulate face detection and descriptor generation
        const faces = simulateFaceDetection(req.file.buffer);
        
        if (faces.length === 0) {
            return res.status(400).json({ error: 'No face detected in image (simulated)' });
        }

        // Generate face descriptor
        const descriptor = simulateFaceDescriptor();
        
        // Store in database
        const faceRecord = {
            id: nextFaceId++,
            name: name.trim(),
            descriptor: descriptor,
            trainedAt: new Date().toISOString(),
            imageInfo: {
                width: image.getWidth(),
                height: image.getHeight(),
                format: req.file.mimetype
            }
        };

        faceDatabase.push(faceRecord);

        res.json({
            success: true,
            message: `Face registered for ${name} (simulated)`,
            faceId: faceRecord.id,
            totalRegisteredFaces: faceDatabase.length
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

        if (faceDatabase.length === 0) {
            return res.status(400).json({ error: 'No faces have been trained yet' });
        }

        // Process image
        const image = await Jimp.read(req.file.buffer);
        
        // Simulate face detection
        const detectedFaces = simulateFaceDetection(req.file.buffer);

        const results = detectedFaces.map((face, index) => {
            // Generate descriptor for detected face
            const detectedDescriptor = simulateFaceDescriptor();
            
            // Find best match in database
            let bestMatch = null;
            let bestDistance = Infinity;
            
            faceDatabase.forEach(dbFace => {
                const distance = calculateSimilarity(detectedDescriptor, dbFace.descriptor);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = dbFace;
                }
            });

            // Determine if it's a match (threshold: 1.0)
            const isMatch = bestDistance < 1.0;
            const confidence = isMatch ? Math.max(0, 100 - (bestDistance * 50)) : 0;

            return {
                faceId: index,
                box: face.box,
                recognition: {
                    name: isMatch ? bestMatch.name : 'Unknown',
                    confidence: Math.round(confidence),
                    distance: bestDistance,
                    isMatch: isMatch,
                    matchedId: isMatch ? bestMatch.id : null
                }
            };
        });

        res.json({
            success: true,
            message: 'Face recognition completed (simulated)',
            facesDetected: detectedFaces.length,
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
    const faces = faceDatabase.map(face => ({
        id: face.id,
        name: face.name,
        trainedAt: face.trainedAt,
        imageInfo: face.imageInfo
    }));

    res.json({
        success: true,
        totalFaces: faceDatabase.length,
        faces: faces
    });
});

// 6. Delete a registered face
app.delete('/api/faces/:id', (req, res) => {
    const faceId = parseInt(req.params.id);
    
    const index = faceDatabase.findIndex(face => face.id === faceId);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Face not found' });
    }

    const deletedFace = faceDatabase.splice(index, 1)[0];

    res.json({
        success: true,
        message: `Face ${deletedFace.name} (ID: ${faceId}) removed`,
        remainingFaces: faceDatabase.length
    });
});

// 7. Clear all registered faces
app.delete('/api/faces', (req, res) => {
    const clearedCount = faceDatabase.length;
    faceDatabase = [];
    nextFaceId = 1;

    res.json({
        success: true,
        message: `All ${clearedCount} registered faces cleared`
    });
});

// 8. Get face by ID
app.get('/api/faces/:id', (req, res) => {
    const faceId = parseInt(req.params.id);
    const face = faceDatabase.find(f => f.id === faceId);
    
    if (!face) {
        return res.status(404).json({ error: 'Face not found' });
    }

    res.json({
        success: true,
        face: {
            id: face.id,
            name: face.name,
            trainedAt: face.trainedAt,
            imageInfo: face.imageInfo
        }
    });
});

// Serve static files
app.use(express.static(__dirname));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple Face Recognition API running on http://localhost:${PORT}`);
    console.log(`📋 API Documentation: http://localhost:${PORT}/api-docs.html`);
    console.log(`⚠️  Note: This is a simplified demo version without actual ML models`);
    console.log(`   For testing API endpoints and workflows only`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    process.exit(0);
});