# Backend Service

This directory contains the Python backend for the Idit project. It's a simple FastAPI application that serves image data.

## Running Locally

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the backend server:**
    ```bash
    uvicorn main:app --reload
    ```

The server will be running at `http://localhost:8000`.

## Deployment

You can deploy this backend to any platform that supports Python applications. Here are instructions for a few common platforms:

### Vercel

1.  **Install the Vercel CLI:**
    ```bash
    npm install -g vercel
    ```

2.  **Deploy from the project root directory:**
    ```bash
    vercel
    ```
    Vercel will automatically detect the Python backend and deploy it. You will need to configure the rewrite rules to direct traffic to the backend.