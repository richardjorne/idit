# Backend Auth Service

This folder contains the **Flask-based authentication backend** for the IdIt project.  
It is responsible for:

- Registering new users
- Authenticating existing users
- Storing and validating credentials against a PostgreSQL database

The backend is designed to work both locally and in a deployed environment (Render).

---

## Overview

### Responsibilities

- `POST /api/register`
  - Create a new user (username, email, password)
  - Hash the password using `bcrypt`
  - Store the user in PostgreSQL
  - Create an associated `credit_accounts` record

- `POST /api/login`
  - Authenticate a user using username **or** email plus password
  - Verify the password using `bcrypt`
  - Return basic user info (`userId`, `username`, `email`) on success

### Tech Stack

- **Flask** – web framework
- **Flask-CORS** – CORS support for frontend integration
- **SQLAlchemy** – ORM and DB session management
- **PostgreSQL** – persistence layer
- **psycopg2-binary** – PostgreSQL driver
- **bcrypt** – password hashing and verification
- **gunicorn** – WSGI server for production (Render)

---

## File Overview

All paths below are relative to `backend/`.

- `app.py`
  - Flask app factory and entry point
  - Registers the auth blueprint
  - Configures CORS (via `FRONTEND_ORIGINS` environment variable)
  - Provides health check route `/`

- `auth_routes.py`
  - Defines:
    - `POST /api/register`
    - `POST /api/login`
  - Uses SQLAlchemy sessions to interact with the database
  - Uses `bcrypt` helpers from `security.py` for hashing and verification

- `database.py`
  - Reads `DATABASE_URL` from environment (with a local default)
  - Creates SQLAlchemy `engine`, `SessionLocal`, and `Base` (declarative base)

- `models.py`
  - `User` model:
    - `user_id` (UUID primary key)
    - `username` (unique)
    - `email` (unique)
    - `password_hash`
    - timestamps (`created_at`, `updated_at`)
  - `CreditAccount` model:
    - `account_id` (UUID primary key)
    - `user_id` (FK to `User`, one-to-one)
    - `balance` (integer, default 0)

- `security.py`
  - `hash_password(plain_password: str) -> str`
  - `verify_password(plain_password: str, hashed_password: str) -> bool`
  - Wraps `bcrypt` functionality

- `init_db.py`
  - One-shot database initialization script
  - Uses `DATABASE_URL` environment variable
  - Creates:
    - `users` table
    - `credit_accounts` table
  - Enables `uuid-ossp` extension where available

- `requirements.txt`
  - Python dependencies for this backend service

---

## Environment Variables

The backend uses the following environment variables:

- `DATABASE_URL` (required in production)
  - PostgreSQL connection string
  - Examples:
    - Local: `postgresql://postgres:password@localhost:5432/postgres`
    - Deployed (Render): `postgresql://user:password@host:5432/database_name`

- `FRONTEND_ORIGINS` (optional but recommended)
  - Comma-separated list of allowed frontend origins for CORS
  - Used in `app.py` to configure `Flask-CORS`
  - Example:

    ```text
    http://localhost:5173,https://idit-git-main-wusangggs-projects.vercel.app
    ```

If `FRONTEND_ORIGINS` is not set, the default is `http://localhost:5173`.

---

## Running the Backend Locally

### 1. Create and activate a virtual environment (optional but recommended)

From the project root (the directory that contains `backend/`):

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
````

### 2. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Configure the database and initialize tables

Either:

* Set `DATABASE_URL` in your shell, or
* Rely on the default value in `database.py` (for a local PostgreSQL instance)

Then run:

```bash
python backend/init_db.py
```

This will create the required tables (and extension) in the configured PostgreSQL database.

### 4. Start the Flask app

```bash
python backend/app.py
```

The backend will start on `http://localhost:5000/`.

You can verify it by visiting:

```text
http://localhost:5000/
```

Expected response (JSON):

```json
{"status": "ok", "message": "Auth backend is running"}
```

---

## API Endpoints

### `POST /api/register`

**Description**: Create a new user account.

**URL** (local):

```text
http://localhost:5000/api/register
```

**Request body** (JSON):

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

**Behavior**:

* Validates that all fields are present
* Checks for duplicate username or email
* Hashes the password with `bcrypt`
* Inserts a new `User` and associated `CreditAccount` into the DB

**Successful response** (`201 Created`):

```json
{
  "userId": "uuid-string",
  "username": "testuser",
  "email": "test@example.com"
}
```

**Possible error responses**:

* `400 Bad Request` – missing or invalid data
* `409 Conflict` – username or email already taken
* `500 Internal Server Error` – unexpected error (check logs)

---

### `POST /api/login`

**Description**: Authenticate a user.

**URL** (local):

```text
http://localhost:5000/api/login
```

**Request body** (JSON):

```json
{
  "username": "testuser",
  "password": "123456"
}
```

**Behavior**:

* Treats `username` as either a username or an email
* Fetches the matching user from the database
* Verifies the password using `bcrypt`
* Returns basic user information on success

**Successful response** (`200 OK`):

```json
{
  "userId": "uuid-string",
  "username": "testuser",
  "email": "test@example.com"
}
```

**Possible error responses**:

* `400 Bad Request` – missing or invalid data
* `401 Unauthorized` – user not found or password mismatch
* `500 Internal Server Error` – unexpected error (check logs)

---

## Manual Verification (Local)

After starting the local backend (`python backend/app.py`) and initializing the DB, you can verify the endpoints with `curl`:

### Register a user

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@example.com",
    "password": "Secret123"
  }'
```

Expected result: HTTP `201` and JSON with `userId`, `username`, `email`.

### Log in with the same user

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "password": "Secret123"
  }'
```

or using email:

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo@example.com",
    "password": "Secret123"
  }'
```

Expected result: HTTP `200` and JSON with `userId`, `username`, `email`.

---

## Verification with Deployed Frontend

The deployed frontend is available at:

```text
https://idit-git-main-wusangggs-projects.vercel.app
```

The deployed backend (auth service) is available at:

```text
https://idit.onrender.com
```

Frontend and backend integration:

* The frontend uses `VITE_AUTH_BASE_URL` (set in Vercel) to call:

  * `POST https://idit.onrender.com/api/register`
  * `POST https://idit.onrender.com/api/login`
* The backend uses `FRONTEND_ORIGINS` (set in Render) to allow CORS for:

  * `http://localhost:5173` (local dev)
  * `https://idit-git-main-wusangggs-projects.vercel.app` (deployed frontend)

### End-to-end test (deployed environment)

1. Open the deployed frontend:

   ```text
   https://idit-git-main-wusangggs-projects.vercel.app
   ```

2. Go to the **Register** page:

   * Fill in username, email, and password
   * Submit
   * This triggers `POST /api/register` against the Render backend

3. Go to the **Login** page:

   * Use the same credentials
   * On success, the frontend stores the returned user in `localStorage.currentUser` and redirects to the home page

This verifies:

> Browser → Deployed frontend → Deployed Flask backend → PostgreSQL → response back to frontend

---

## Troubleshooting

* **CORS errors in the browser**

  * Ensure `FRONTEND_ORIGINS` on the backend includes the exact frontend origin (e.g. `https://idit-git-main-wusangggs-projects.vercel.app`).
  * Redeploy the backend after changing environment variables.

* **`Failed to fetch` or network errors**

  * Verify that the backend is reachable in a browser:

    * `https://idit.onrender.com/` should return the health check JSON.
  * Confirm that the frontend is configured with the correct `VITE_AUTH_BASE_URL`.

* **Database errors (e.g., relation does not exist)**

  * Re-run `backend/init_db.py` against the same `DATABASE_URL` used by the backend service.
  * Confirm that the connection string is correct and the DB user has permission to create tables.

* **Login always fails**

  * Make sure you registered the user successfully before logging in.
  * Ensure that the same password is used and that there are no typos in username/email.
