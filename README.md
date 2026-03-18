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
- **Modern UI/UX**: Built with React, featuring a responsive design, Framer Motion animations, and a seamless Dark/Light theme toggle.

## Details of Key Variables Used

The core state management in the frontend (`App.js`) utilizes several key variables:

- `loggedIn` (Boolean): Tracks whether the current user is authenticated. Checks `localStorage` and `sessionStorage` for session active state and expiration (10 minutes).
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
- **Storage**: Minimum 1-2 GB of free space for dependencies, models, and virtual environments.

### Software Requirements
- **Operating System**: Windows (10/11), Linux, or macOS.
- **Backend Environment**: Python 3.8 or higher.
- **Frontend Environment**: Node.js (v14.0.0 or higher) and npm.
- **Key Python Libraries**: `fastapi`, `uvicorn`, `tensorflow` (>=2.15.0), `librosa`, `scikit-learn`, `pymongo`, `opencv-python-headless`.
- **Database**: MongoDB (required for storing `stats` and `history`).

## Compiling and Running Procedure

Follow these steps to set up and run the Soundscape AI application locally.

### 1. Backend Setup

1. Open your terminal and navigate to the root directory of the project.
2. Create a Python virtual environment:
   ```bash
   python -m venv backend/myenv
   ```
3. Activate the virtual environment (Windows):
   ```bash
   ./backend/myenv/Scripts/activate
   ```
   *(For macOS/Linux, use `source backend/myenv/bin/activate`)*
4. Navigate to the backend directory:
   ```bash
   cd backend
   ```
5. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Start the FastAPI backend server using Uvicorn:
   ```bash
   uvicorn app:app
   ```
   *(The backend server will typically run on `http://localhost:8000`)*

### 2. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   cd frontend  # Note: Navigate to the inner frontend folder where package.json is located
   ```
2. Install the necessary Node modules:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   *(The frontend application will compile and open in your default browser, typically at `http://localhost:3000`)*

---

### 3. Database Setup (MongoDB)

Soundscape AI utilizes **MongoDB**, a flexible NoSQL database perfectly suited for capturing unstructured ML inference outputs, to persist all primary analytical data. The database plays a crucial role in:
- **User Authentication**: Securely managing user profiles and login credentials to restrict dashboard access. When a new user registers, their initial account details are securely created and stored in the database.
- **Prediction History**: Persisting raw analysis results such as inferred noise levels (`noise_level`), class confidences, and calculation timestamps, which are accessible through the `/history` endpoint.
- **Aggregated Statistics**: Compiling distributions of noise categories over time. These metrics are dynamically queried by the frontend `/stats` endpoint to plot real-time pie and bar charts across the React dashboard.

To ensure the backend operates flawlessly:
- Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community) and ensure the MongoDB service is actively running (usually on default port `27017`), or update your connection string to point to MongoDB Atlas.
- Your FastAPI backend leverages `pymongo` to seamlessly connect, write user data, and query historical statistics.

**Note**: Ensure your MongoDB instance is running locally or properly configured in your backend settings so that dashboard history and stats can be fetched and displayed without disruption.
