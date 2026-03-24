# Soundscape AI

Soundscape AI is a full-stack web application designed for analyzing audio to predict and classify noise levels. It utilizes Machine Learning (ML), Convolutional Neural Networks (CNN), and hybrid approaches for audio classification, providing users with actionable insights through a responsive, interactive dashboard.

## Salient Features

- **Audio Upload & Analysis**: Upload audio files to perform ML/Hybrid or CNN-based predictions on noise levels.
- **Result Visualization**: Detailed result cards displaying prediction outcomes and CNN explainability data.
- **Noise Route Map**: Visual geographical representation of noise levels based on sound analysis.
- **Accuracy Comparison**: Interactive graphs comparing the accuracy of different implemented models.
- **Dashboard Statistics**: Visual graphs showcasing different noise statistics over time.
- **Prediction History**: A log of previous predictions fetched from the database.
- **Secure Sessions**: User authentication with session expiration and secure local/session storage management.
- **Modern UI/UX**: Built with **Vite + React**, featuring lightning-fast development, responsive design, Framer Motion animations, and seamless Dark/Light theme toggle.

## Technology Stack

### Frontend
- **⚡ Vite** - Ultra-fast build tool and development server
- **⚛️ React 19** - Modern React with latest features
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🎭 Framer Motion** - Smooth animations and transitions
- **🗺️ Leaflet + React Leaflet** - Interactive maps
- **📊 Chart.js** - Data visualization
- **🎯 Radix UI** - Accessible component primitives

### Backend
- **🚀 FastAPI** - High-performance Python web framework
- **🤖 TensorFlow** - Machine learning and CNN models
- **🎵 Librosa** - Audio analysis and feature extraction
- **📊 Scikit-learn** - Traditional ML algorithms
- **🗄️ MongoDB** - NoSQL database for user data and predictions

## Details of Key Variables Used

The core state management in the frontend (`App.jsx`) utilizes several key variables:

- `loggedIn` (Boolean): Tracks whether the current user is authenticated. Checks `localStorage` and `sessionStorage` for session active state and expiration (1 hour).
- `activeSection` (String): Determines which component is currently rendered on the dashboard (e.g., `'upload'`, `'route'`, `'accuracy'`, `'stats'`, `'history'`, or `'all'`).
- `sidebarCollapsed` (Boolean): Toggles the expansive/collapsed state of the navigation sidebar.
- `showLogoutDialog` (Boolean): Controls the visibility of the logout confirmation modal.
- `result` (Object): Stores the prediction results returned from the ML/Hybrid backend processing, including the predicted `noise_level`.
- `cnnData` (Object): Stores prediction and explainability data returned from the CNN model.
- `stats` (Object): Holds the statistical data fetched from the backend `/stats` endpoint.
- `history` (Array): Stores the timeline of past predictions fetched from the backend `/history` endpoint.

## Hardware and Software Requirements

### Hardware Requirements
- **Processor**: Multi-core processor (Intel i5/Ryzen 5 or better recommended for handling model inference).
- **RAM**: Minimum 8 GB (16 GB recommended if training or analyzing large audio datasets).
- **Storage**: Minimum 2-3 GB of free space for dependencies, models, and virtual environments.

### Software Requirements
- **Operating System**: Windows (10/11), Linux, or macOS.
- **Backend Environment**: Python 3.8 or higher.
- **Frontend Environment**: Node.js (v18.0.0 or higher) and npm.
- **Key Python Libraries**: `fastapi`, `uvicorn`, `tensorflow` (>=2.15.0), `librosa`, `scikit-learn`, `pymongo`, `opencv-python-headless`.
- **Database**: MongoDB (local installation or MongoDB Atlas).

## Compiling and Running Procedure

Follow these steps to set up and run the Soundscape AI application locally.

### 1. Backend Setup

1. Open your terminal and navigate to the root directory of the project.
2. Create a Python virtual environment:
   ```bash
   python -m venv backend/myenv
   ```
3. Activate the virtual environment:
   ```bash
   # Windows
   ./backend/myenv/Scripts/activate
   
   # macOS/Linux
   source backend/myenv/bin/activate
   ```
4. Navigate to the backend directory:
   ```bash
   cd backend/backend
   ```
5. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Start the FastAPI backend server:
   ```bash
   # Method 1: Using the startup script (Windows)
   start_backend.bat
   
   # Method 2: Using Python script
   python start_backend.py
   
   # Method 3: Direct uvicorn command
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```
   *(The backend server will run on `http://localhost:8000`)*

### 2. Frontend Setup (Vite)

1. Open a new terminal window and navigate to the Vite frontend directory:
   ```bash
   cd frontend/soundscape-vite
   ```
2. Install the necessary Node modules:
   ```bash
   npm install
   ```
3. Create environment file (`.env`):
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The frontend application will start on `http://localhost:5173` or next available port)*

### 3. Build for Production

To create a production build of the frontend:
```bash
cd frontend/soundscape-vite
npm run build
```
The built files will be in the `dist/` directory.

---

### 4. Database Setup (MongoDB)

Soundscape AI utilizes **MongoDB**, a flexible NoSQL database perfectly suited for capturing unstructured ML inference outputs, to persist all primary analytical data. The database plays a crucial role in:
- **User Authentication**: Securely managing user profiles and login credentials to restrict dashboard access.
- **Prediction History**: Persisting raw analysis results such as inferred noise levels (`noise_level`), class confidences, and calculation timestamps.
- **Aggregated Statistics**: Compiling distributions of noise categories over time for real-time dashboard visualizations.

**Note**: Ensure your MongoDB instance is running and accessible for the backend to store user data and prediction history.

## Environment Variables

### Frontend (Vite)
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)
- `VITE_MAPBOX_ACCESS_TOKEN` - Mapbox token for route mapping features


