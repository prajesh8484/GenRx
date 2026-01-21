# GenRx

<p align="center">
<a href="https://github.com/prajesh8484/GenRx"><img src="https://img.shields.io/github/languages/code-size/prajesh8484/GenRx"></a>
<a href="https://github.com/prajesh8484/GenRx/commits"><img src="https://img.shields.io/github/last-commit/prajesh8484/GenRx"></a>
</p>

## Description

**GenRx** is an intelligent healthcare platform designed to make medicine affordable and accessible for Indians. It utilizes advanced AI agents to search, analyze, and recommend cheaper **Generic Alternatives** to expensive brand-name medicines

By integrating real-time data from **Jan Aushadhi Kendras** and other reputable pharmacies, GenRx empowers users to save on their medical bills without compromising on quality

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Screenshots](#screenshots)

## Features

- **AI-Powered Medicine Search**: Smart agents compare prices across standard pharmacies and government Jan Aushadhi stores.
- **Verified Generic Alternatives**: Automatically identifies active salts and suggests cost-effective generic substitutes.
- **Elderly Friendly Mode**: One-click accessibility toggle that increases font size and contrast for better readability.
- **Multi-Language Support**: Full UI translation for English, Hindi (हिंदी), Marathi (मराठी), Tamil (தமிழ்), Telugu (తెలుగు), and Bengali (বাংলা)
- **Store Locator**: Find nearby Jan Aushadhi Kendras with geolocation support.
- **Responsive Design**: Optimized for seamless experience across mobile, tablet, and desktop devices.
- **Secure Admin Access**: Frontend authentication layer for administrative control (Demo).

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend (Logic)**: Python, FastAPI, LangChain, Groq (LLM), SerpAPI
- **Backend (Proxy)**: Node.js, Express
- **AI/LLM**: gpt-oss-120b via Groq for intelligent agentic reasoning

## Installation

Follow these steps to set up the project locally.

### Prerequisites
- Node.js & npm installed
- Python 3.8+ installed
- API Keys for **Groq** and **SerpAPI**

### 1. Clone the Repository
```bash
git clone https://github.com/prajesh8484/GenRx.git
cd GenRx
```

### 2. Backend Setup (Python)
Navigate to the python backend service.
```bash
cd backend_python
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r ../requirements.txt
```
Create a `.env` file in `backend_python/` and add your keys:
```env
GROQ_API_KEY=your_groq_key
SERPAPI_API_KEY=your_serpapi_key
```
Start the Python Server:
```bash
python backend.py
# Runs on http://localhost:8000
```

### 3. Middleware Setup (Node.js)
Open a new terminal and navigate to the node backend.
```bash
cd backend_node
npm install
```
Start the Node Server:
```bash
npm run dev
# Runs on http://localhost:3000
```

### 4. Frontend Setup (React)
Open a new terminal and navigate to the UI folder.
```bash
cd genrx-ui
npm install
```
Start the React App:
```bash
npm run dev
# Runs on http://localhost:5173
```

## Screenshots

<!-- <div align="center">
  <img src="screenshot1.png" alt="Dashboard" width="45%" />
  <img src="screenshot2.png" alt="Search Results" width="45%" />
</div> -->

