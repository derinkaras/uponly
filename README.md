# UpOnly Finance Tracker

## Overview

The UpOnly finance tracker is a simple web application designed to help users monitor their income, expenses, and savings efficiently. With an intuitive dashboard and real-time analytics, UpOnly makes it easy to manage personal finances.

## Features

- **Expense Tracking**: Log and categorize expenses effortlessly.
- **Income Management**: Record multiple income sources.
- **Budget Planning**: Set spending limits and track progress.
- **Financial Insights**: Visualize spending trends with basic reports.
- **Authentication**: Secure login with Firebase Auth.
- **Bank API Integration**: Optionally connect to banking APIs to fetch transaction data, which is then automatically categorized using ChatGPT’s API.

## Tech Stack

- **Frontend**: React
- **Backend**: Firebase Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **API Integration**: Optional integration with respective bank APIs

## Installation

### Prerequisites

- Node.js (v16+)
- Firebase account
- Git

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/UpOnly.git
   cd UpOnly
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```
4. Start the development server:
   ```sh
   npm start
   ```
5. Access the app at `http://localhost:3000`

## API Endpoints (if bank API is used)

- `POST /api/auth/signup` – Register a new user
- `POST /api/auth/login` – Authenticate user
- `GET /api/transactions` – Retrieve transaction history
- `POST /api/transactions` – Add a new transaction


