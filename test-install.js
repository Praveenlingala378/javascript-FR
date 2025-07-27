// Simple test to verify installation
console.log('Testing package installation...');

try {
    const express = require('express');
    console.log('✅ Express installed successfully');
    
    const multer = require('multer');
    console.log('✅ Multer installed successfully');
    
    const cors = require('cors');
    console.log('✅ CORS installed successfully');
    
    const Jimp = require('jimp');
    console.log('✅ Jimp installed successfully');
    
    console.log('\n🎉 All packages installed correctly!');
    console.log('You can now run: npm start');
    
} catch (error) {
    console.error('❌ Installation error:', error.message);
    console.log('Please run: npm install');
}