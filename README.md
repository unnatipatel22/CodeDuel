# CodeDuel

CodeDuel is a real-time competitive programming platform that enables developers to participate in live coding contests, solve algorithmic challenges, and compete against other programmers in multiplayer coding rooms. The platform provides instant code evaluation, live rankings, and a seamless coding experience to make technical interview preparation more engaging and interactive.

---

## Table of Contents

- Overview
- Features
- Tech Stack
- System Architecture
- Project Structure
- Getting Started
- Environment Variables
- Screenshots
- Roadmap
- Contributing
- License

---

## Overview

CodeDuel is designed to simulate real-time coding competitions by allowing users to create or join coding rooms, solve programming challenges within a time limit, and compete on a live leaderboard. The platform supports multiple programming languages and provides instant feedback through an online code execution engine.

---

## Features

- User authentication and authorization
- Create and join private coding rooms
- Solo, 1v1, and multiplayer coding contests
- Topic-based coding challenges
- Difficulty-based problem selection
- Real-time contest timer
- Live leaderboard updates
- Online code compilation and execution
- Multiple programming language support
- Submission history
- User profile and performance tracking
- Admin dashboard for managing coding problems

---

## Tech Stack

### Frontend

- React
- Vite

### Backend

- Node.js
- Express.js

### Database

- MongoDB

### Additional Technologies

- Socket.IO
- Judge0 API
- JWT Authentication

---

## System Architecture

```
                    +-------------------+
                    |      Client       |
                    |    React + Vite   |
                    +---------+---------+
                              |
                         HTTP / WebSocket
                              |
                    +---------v---------+
                    |   Express Server  |
                    +---------+---------+
                              |
             +----------------+----------------+
             |                                 |
     MongoDB Database                  Judge0 API
     User & Contest Data             Code Execution
```

---

## Project Structure

```text
CodeDuel/
│
├── frontend/
│
├── backend/
│
├── admin-panel/
│
├── DEPLOYMENT.md
│
├── package.json
│
└── README.md
```

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/unnatipatel22/CodeDuel.git
```

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
npm start
```

---

## Environment Variables

Create a `.env` file and configure the required environment variables before running the project.

Example:

```env
PORT=

MONGODB_URI=

JWT_SECRET=

JUDGE0_API_KEY=

FRONTEND_URL=
```

## Future Roadmap

- Team coding contests
- AI-powered coding assistance
- Contest analytics
- Daily coding challenges
- Global ranking system
- Achievement badges
- Code plagiarism detection
- Contest replay and discussion

---


## Author

**Unnati Patel**

GitHub: https://github.com/unnatipatel22
