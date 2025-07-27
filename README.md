<<<<<<< HEAD
# 🧠 JavaScript Face Recognition Project

A comprehensive face recognition application with both web interface and REST API, built using face-api.js and Node.js.

## 🌟 Features

### **Web Application**
- ✅ Real-time face detection
- ✅ 68-point facial landmark detection
- ✅ Facial expression recognition
- ✅ Face recognition with training
- ✅ Live camera feed processing

### **REST API**
- ✅ Face detection endpoints
- ✅ Face training/registration
- ✅ Face recognition API
- ✅ Image upload handling
- ✅ Complete CRUD operations

## 🚀 Quick Start

### **Web Application**
1. Start a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

2. Open in browser:
   ```
   http://localhost:8000/face-recognition.html
   ```

3. Allow camera access and start using face recognition!

### **REST API**
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start API server:
   ```bash
   npm start
   ```

3. API available at:
   ```
   http://localhost:3001
   ```

## 📁 Project Structure

```
javascript-FR/
├── 📄 index.html                    # Basic face detection demo
├── 🧠 face-recognition.html         # Full face recognition app
├── 📜 script.js                     # Face recognition logic
├── 🖥️ server-simple.js              # REST API server
├── 📦 package.json                  # Node.js dependencies
├── 📋 api-docs.html                 # API documentation
├── 🔧 Face-Recognition-API.postman_collection.json  # Postman collection
├── 📁 models/                       # Face-api.js model files
│   ├── tiny_face_detector_model-*
│   ├── face_landmark_68_model-*
│   ├── face_recognition_model-*
│   └── face_expression_model-*
└── 📚 README.md                     # This file
```

## 🎯 Use Cases

- **Real-time face detection** in web browsers
- **Face recognition systems** for access control
- **Emotion detection** for user experience analysis
- **API development** for face recognition services
- **Learning face-api.js** and computer vision concepts

## 🛠️ Technologies Used

- **face-api.js** - Face detection and recognition
- **TensorFlow.js** - Machine learning models
- **Express.js** - REST API server
- **Multer** - File upload handling
- **Jimp** - Image processing
- **HTML5 Canvas** - Real-time video processing

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API status |
| POST | `/api/detect` | Detect faces in image |
| POST | `/api/train` | Register a face with name |
| POST | `/api/recognize` | Recognize faces in image |
| GET | `/api/faces` | List all registered faces |
| DELETE | `/api/faces/:id` | Delete specific face |
| DELETE | `/api/faces` | Clear all faces |

## 🧪 Testing

### **Postman Testing**
1. Import `Face-Recognition-API.postman_collection.json`
2. Set base URL to `http://localhost:3001`
3. Test all endpoints with image uploads

### **Web Testing**
1. Open `face-recognition.html`
2. Train faces by entering names
3. Test real-time recognition

## 📋 Requirements

- **Node.js** 14+ (for API server)
- **Modern browser** with WebRTC support
- **Camera access** for live detection
- **HTTPS or localhost** (browser security requirement)

## 🔧 Installation

### **Clone Repository**
```bash
git clone https://github.com/Praveenlingala378/javascript-FR.git
cd javascript-FR
```

### **Install API Dependencies**
```bash
npm install
```

### **Download Model Files**
The `models/` directory contains pre-trained face-api.js models:
- Face detection models
- Facial landmark models  
- Face recognition models
- Expression recognition models

## 🎨 Screenshots

### Web Application
- Real-time face detection with bounding boxes
- 68-point facial landmarks overlay
- Expression recognition labels
- Face recognition with confidence scores

### API Testing
- Postman collection for all endpoints
- Image upload and processing
- JSON responses with detection data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **face-api.js** - Amazing face recognition library
- **TensorFlow.js** - Machine learning in JavaScript
- **MediaDevices API** - Camera access in browsers

## 📞 Support

If you have any questions or issues:
1. Check the [API documentation](api-docs.html)
2. Review the [Postman collection](Face-Recognition-API.postman_collection.json)
3. Open an issue on GitHub

---

**⭐ Star this repository if you found it helpful!**
=======
# javascript-FR
>>>>>>> a3faf0b8e2a504363ba2af46217552b183c7e895
