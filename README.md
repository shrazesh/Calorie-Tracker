# caloriEE 🍎🥗

`caloriEE` is a full-stack calorie tracking and nutritional planning web application. It integrates a MERN stack (MongoDB, Express, React, Node.js) web application with a Python-based Machine Learning service that performs image-based food recognition.

> [!NOTE]  
> **Project Status: Work in Progress (WIP)**  
> This project is currently in active development. Core features like daily calorie targets, database seeding, vector-based food recommendations, and basic food log endpoints are implemented, while frontend integrations and ML model tuning are being finalized.

---

## 🚀 Key Features

*   **Custom BMR & TDEE Calculation**: Personalized daily calorie targets calculated dynamically using the **Mifflin–St Jeor** formula based on user health metrics (age, gender, height, weight, and activity level).
*   **AI Food Recognition**: Upload images of meals to recognize food items via a TensorFlow/FastAPI machine learning model.
*   **Vector Food Recommendation**: Search and match foods or recommend alternatives using vector-based similarity matching.
*   **Complete Food Log**: Log meals, track daily macro targets (protein, fat, carbs), and visualize progress.
*   **Robust Seed System**: Quick setup with standard predefined foods mapped to various categories and nutritional specs.

---

## 📁 Repository Architecture

The project is structured into three main directories:

```
caloriEE/
├── client/          # React frontend (Vite, TailwindCSS)
├── server/          # Node.js Express API server
├── ml-server/       # Python ML service (TensorFlow, FastAPI, Uvicorn)
├── seedFromJson.js  # Script to populate MongoDB with standard food items
└── .gitignore       # Git exclusion rules (ignores node_modules, env keys, venv, etc.)
```

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), TailwindCSS, Recharts (for analytics), Lucide React (for icons)
*   **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT) for authentication
*   **ML Service**: Python, TensorFlow, FastAPI, Uvicorn, Pillow, NumPy
*   **Database**: MongoDB (Local or Atlas)

---

## ⚙️ Setup and Installation

### 1. Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16+)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017` or a MongoDB Atlas URI)
*   [Python 3.8+](https://www.python.org/downloads/)
*   [Git](https://git-scm.com/)

---

### 2. Backend Server Setup (`server/`)
1. Navigate to the `server/` folder.
2. Install Node dependencies:
   ```bash
   cd server
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the variables in `.env` with your actual MongoDB URI, port, and a secure JWT secret:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/calorie-tracker
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5001
   ```
5. Seed the database with food dataset items (run this command from the root project directory):
   ```bash
   cd ..
   node seedFromJson.js
   ```
6. Start the server in development mode:
   ```bash
   cd server
   npm run dev
   ```
   *The backend will be running on [http://localhost:5001](http://localhost:5001).*

---

### 3. Frontend Client Setup (`client/`)
1. Navigate to the `client/` folder:
   ```bash
   cd client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will be running on [http://localhost:5173](http://localhost:5173).*

---

### 4. ML Server Setup (`ml-server/`)
1. Navigate to the `ml-server/` folder:
   ```bash
   cd ml-server
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Uvicorn ASGI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The ML service will be running on [http://localhost:8000](http://localhost:8000).*

---

## 🛠️ Current Development Tasks (WIP)
As the project is in a development phase, here is what we are working on:
*   [ ] Refining TensorFlow model accuracy for local food categories.
*   [ ] Enhancing frontend analytics graphs for weekly macro summaries.
*   [ ] Adding test coverage to backend authentication routes.
*   [ ] Deploying backend & ML API endpoints.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
