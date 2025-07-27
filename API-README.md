# 🚀 Simple Face Recognition API

A simplified Face Recognition REST API for testing and development purposes.

## ⚠️ Important Note

This is a **simplified demo version** that simulates face recognition functionality without requiring complex native dependencies like Cairo/Canvas. It's perfect for:

- **API Testing** with Postman
- **Learning REST API patterns**
- **Prototyping applications**
- **Testing workflows**

## 🛠️ Installation

### Option 1: Automatic Installation
```bash
# Run the installation script
install-simple.bat
```

### Option 2: Manual Installation
```bash
# Install dependencies
npm install

# Start the server
npm start
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the API server:**
   ```bash
   npm start
   ```

3. **API will be available at:**
   ```
   http://localhost:3001
   ```

4. **Import Postman collection:**
   - Import `Face-Recognition-API.postman_collection.json`
   - Start testing immediately!

## 📡 API Endpoints

### 1. Health Check
```
GET /api/health
```

### 2. Detect Faces
```
POST /api/detect
Body: form-data
- image: [Upload image file]
```

### 3. Train Face
```
POST /api/train
Body: form-data
- image: [Upload image file]
- name: "Person Name"
```

### 4. Recognize Faces
```
POST /api/recognize
Body: form-data
- image: [Upload image file]
```

### 5. Get All Faces
```
GET /api/faces
```

### 6. Delete Face
```
DELETE /api/faces/:id
```

### 7. Clear All Faces
```
DELETE /api/faces
```

## 🧪 Testing with Postman

1. **Import Collection:**
   - File → Import → `Face-Recognition-API.postman_collection.json`

2. **Test Workflow:**
   ```
   1. GET /api/health          (Check API status)
   2. POST /api/train          (Upload person's photo)
   3. POST /api/recognize      (Test recognition)
   4. GET /api/faces           (View registered faces)
   ```

3. **Sample Images:**
   - Use any JPG/PNG images
   - Clear, front-facing photos work best
   - Max file size: 10MB

## 📋 Example Responses

### Health Check
```json
{
  "status": "OK",
  "message": "Simple Face Recognition API is running",
  "registeredFaces": 2,
  "note": "This is a simplified demo API"
}
```

### Face Detection
```json
{
  "success": true,
  "facesDetected": 1,
  "faces": [
    {
      "faceId": 0,
      "confidence": 0.92,
      "box": { "x": 100, "y": 50, "width": 150, "height": 180 },
      "expressions": {
        "happy": 0.85,
        "neutral": 0.12
      }
    }
  ]
}
```

### Face Recognition
```json
{
  "success": true,
  "facesDetected": 1,
  "faces": [
    {
      "faceId": 0,
      "recognition": {
        "name": "John",
        "confidence": 87,
        "isMatch": true
      }
    }
  ]
}
```

## 🔧 Features

- ✅ **REST API** with all CRUD operations
- ✅ **File upload** support
- ✅ **Image validation** using Jimp
- ✅ **Simulated face detection**
- ✅ **Simulated face recognition**
- ✅ **In-memory database**
- ✅ **Complete error handling**
- ✅ **CORS enabled**
- ✅ **Postman collection included**

## 🎯 Use Cases

- **API Development:** Test REST endpoints
- **Frontend Development:** Mock backend for face recognition apps
- **Learning:** Understand face recognition API patterns
- **Prototyping:** Quick setup for demos
- **Testing:** Validate API integration workflows

## 📁 Files

- `server-simple.js` - Main API server
- `package.json` - Dependencies
- `Face-Recognition-API.postman_collection.json` - Postman collection
- `api-docs.html` - Detailed documentation
- `install-simple.bat` - Installation script

## 🚀 Next Steps

Once you've tested the API workflows, you can:

1. **Integrate with real ML models** (TensorFlow.js, OpenCV)
2. **Add database persistence** (MongoDB, PostgreSQL)
3. **Deploy to cloud** (AWS, Azure, Heroku)
4. **Add authentication** (JWT, OAuth)
5. **Scale with Docker** and Kubernetes

## 💡 Tips

- Use clear, well-lit photos for better simulation results
- Test with multiple people to see the database functionality
- Check the console logs for detailed operation info
- Use the health endpoint to verify API status

**Happy Testing!** 🎉