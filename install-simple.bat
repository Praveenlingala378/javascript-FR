@echo off
echo Installing Simple Face Recognition API (No Canvas Dependencies)...
echo.

echo Copying package.json...
copy package-simple.json package.json

echo Installing Node.js packages...
npm install

echo.
echo Installation complete!
echo.
echo To start the Simple API server:
echo   npm start
echo.
echo Or run directly:
echo   node server-simple.js
echo.
echo API will be available at: http://localhost:3001
echo API Documentation: http://localhost:3001/api-docs.html
echo.
echo Note: This is a simplified demo version for testing API workflows
echo.
pause