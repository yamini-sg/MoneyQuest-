# WealthQuest - Featherless AI Backend Server

## Quick Start Guide

### 1. Install Dependencies
Open your terminal inside this folder and run:
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
Your backend will be live at `http://localhost:5000`.

### 3. API Endpoints
- **POST** `/api/generate-scenario` — Dynamically generates personal finance dilemmas with AI.
- **POST** `/api/tutor` — AI Personal Finance coach (requires `{ "question": "...", "topic": "..." }` in the JSON body).
