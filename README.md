# Calorie Tracker and Recommendation System
*Your smart, AI-powered companion for effortless meal tracking and nutrition insights.*

## About the Project
Tracking what you eat shouldn't feel like a chore. This project is a modern, AI-powered calorie tracker that lets you simply snap a photo of your food to instantly log its nutritional value. Whether you're trying to hit specific macro goals or just want to eat a bit healthier, the app provides real-time recommendations and insights to keep you on track.

## Tech Stack
This app is built using the classic MERN stack, plus a little AI magic:
* **MongoDB:** The flexible NoSQL database that stores all user profiles, food logs, and nutrition data.
* **Express.js:** The fast and minimal backend web framework handling our API routes.
* **React:** The frontend library powering our snappy, dynamic user interface.
* **Node.js:** The JavaScript runtime environment executing our backend server.

## Features
* **AI Food Scanning:** Take a picture of your meal and let AI automatically detect the food and its calories.
* **Smart Recommendations:** Get real-time, healthier food swap suggestions based on your daily macro deficits.
* **Body Health Profiling:** Scan your body posture to estimate personalized health metrics and TDEE.
* **Interactive Dashboards:** Visualize your daily and weekly progress with beautiful, easy-to-read charts.
* **Secure Authentication:** Keep your personal health data safe with robust JWT-based user login.

## Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas cloud URI)
* *Optional but recommended:* Python (for the local AI fallback service)

### Installation
1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/calorie-tracker.git
   cd calorie-tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up your Environment Variables**
   Create a `.env` file in the `server` directory (see the section below for details).

5. **Run the App!**
   You'll need two terminal tabs. 
   In terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```
   In terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

## Folder Structure
* `client/` - Contains the React frontend code, UI components, and pages.
* `server/` - Contains the Node.js/Express backend API, database models, and AI service integrations.
* `ai-service/` - (Bonus!) Contains the Python-based local fallback AI services for object detection.

## Environment Variables
To run this project, you will need to add the following environment variables to your `server/.env` file:

`MONGO_URI` - Your MongoDB connection string
`JWT_SECRET` - A secret string used for signing authentication tokens
`PORT` - The port for the backend server (usually 5001)
`GEMINI_API_KEY` - Your Google Gemini API key for the food scanner

## Contributing
Got an idea to make this app even better? Feel free to fork the repo, create a branch, and submit a Pull Request! 

## License
Distributed under the MIT License.