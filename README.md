# AI Lecture Planner

A web application for planning and organizing course lectures using AI to process syllabus content and generate structured course materials.

## Project Structure

This project is organized into frontend and backend components:

### Frontend (React + TypeScript + Vite)
- Located in `/frontend`
- Handles UI, course visualization, and user interactions
- Uses React Flow for course topic visualization
- Communicates with backend API for AI processing

### Backend (Node.js + Express)
- Located in `/backend`
- Handles API requests and OpenRouter AI integration
- Processes syllabus content and generates course materials
- Serves the frontend in production

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000 (optional, defaults to 5000)
NODE_ENV=development (or production)
```

### Installation

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

### Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

### Production Build

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the production server:
```bash
cd backend
npm start
```

## Features

- AI-powered syllabus analysis
- Interactive course topic visualization
- Topic dependency mapping
- Course content generation
- Responsive design

## Technologies

- Frontend: React, TypeScript, Vite, TailwindCSS, React Flow
- Backend: Node.js, Express
- AI: OpenRouter API (Gemini model)