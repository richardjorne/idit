# Backend Auth Service

This folder contains the **Flask backend** responsible for **user registration and login** for the IdIt project.

> Sprint 4 – Task #13:  
> **“Make Login and Register APIs, and communicate with the database. Then implement frontend functions and make sure they work with the backend.”**  
> Owner: **Zhenyu Wu**

---

## Overview

The backend provides a simple authentication service:

- Users can **register** with a username, email, and password.
- Users can **log in** using either **username or email** plus password.
- User data is stored in a **PostgreSQL** database.
- Passwords are **hashed using bcrypt** before being stored.
- The React frontend (Vite + TypeScript) calls these endpoints via a small `authService.ts` wrapper.

The backend is designed for **local development / course demo**, not production security.

---

## Tech Stack

- **Flask** – web framework
- **Flask-CORS** – enable CORS for frontend calls
- **SQLAlchemy** – ORM for PostgreSQL
- **PostgreSQL** – relational database
- **psycopg2-binary** – PostgreSQL driver
- **bcrypt** – password hashing and verification

---

## File Overview

All paths are relative to the `backend/` directory.

- `app.py`  
  - Flask app entry point  
  - Registers the authentication blueprint  
  - Sets up CORS (for `/api/*` routes)  

- `auth_routes.py`  
  - Defines `/api/register` and `/api/login` routes  
  - Implements business logic for registration and login  
  - Interacts with the database using SQLAlchemy sessions  

- `database.py`  
  - Configures `DATABASE_URL`  
  - Creates SQLAlchemy `engine`, `SessionLocal`, and `Base`  
  - All models and routes reuse this shared session creator  

- `models.py`  
  - `User` model  
    - `user_id` (UUID, primary key)  
    - `username`, `email`, `password_hash`  
    - Timestamps (`created_at`, `updated_at`)  
  - `CreditAccount` model  
    - `account_id` (UUID, primary key)  
    - `user_id` (FK to `User`)  
    - `balance`  

- `security.py`  
  - `hash_password(plain_password: str) -> str`  
  - `verify_password(plain_password: str, hashed_password: str) -> bool`  
  - Uses `bcrypt` under the hood  

- `init_db.py`  
  - One-shot script to:
    - Connect to PostgreSQL
    - Ensure required extensions (e.g., `uuid-ossp`) are enabled
    - Create `users` and `credit_accounts` tables if they don’t exist  
  - Should be run **once** after configuring the database

---

## Setup

### 1. Create and activate a virtual environment (recommended)

From the project root (where `backend/` lives):

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
````

### 2. Install dependencies

Inside the virtual environment:

```bash
pip install flask flask-cors sqlalchemy psycopg2-binary bcrypt
```

### 3. Configure the database

Open `backend/database.py` and set a valid PostgreSQL connection string:

```python
# Example (edit with your own credentials)
DATABASE_URL = "postgresql+psycopg2://<user>:<password>@localhost:5432/<dbname>"
```

Make sure:

* PostgreSQL is running locally.
* The database `<dbname>` already exists (you can create it with `createdb <dbname>` or via a GUI tool).
* Username and password are correct.

### 4. Initialize the database schema

From the project root (or inside `backend/`), run:

```bash
python backend/init_db.py
# or, if you are already in backend/:
# python init_db.py
```

Expected: a message indicating tables were created successfully, or that they already exist.

---

## Running the Auth Backend

From the project root:

```bash
python backend/app.py
```

* The Flask app will start on `http://localhost:5000/` by default.
* Visit this in the browser:

  ```text
  http://localhost:5000/
  ```

  Expected JSON response:

  ```json
  {"status": "ok", "message": "Backend is running"}
  ```

CORS is enabled for routes under `/api/*`, so the React frontend can call:

* `http://localhost:5000/api/register`
* `http://localhost:5000/api/login`

---

## API Endpoints

### `POST /api/register`

**Description:**
Create a new user account.

**Request body (JSON):**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

**Behavior:**

* Validates required fields.
* Checks if `username` or `email` is already taken.
* Hashes the password using `bcrypt`.
* Inserts a new `User` and an associated `CreditAccount` into the DB.
* Commits the transaction.

**Responses:**

* `201 Created`

  ```json
  {
    "userId": "uuid-string",
    "username": "testuser",
    "email": "test@example.com"
  }
  ```

* `400 Bad Request` – missing data

* `409 Conflict` – username or email already taken

* `500 Internal Server Error` – unexpected error (see backend logs)

---

### `POST /api/login`

**Description:**
Log in using username or email plus password.

**Request body (JSON):**

```json
{
  "username": "testuser",
  "password": "123456"
}
```

> Note: the frontend sends the value typed in the "Username or Email" field as `username`.

**Behavior:**

* Validates that fields are not empty.
* Searches the DB for a user whose `username` or `email` matches the given value.
* Uses `bcrypt` to verify the provided password against the stored `password_hash`.
* On success, returns basic user info.

**Responses:**

* `200 OK`

  ```json
  {
    "userId": "uuid-string",
    "username": "testuser",
    "email": "test@example.com"
  }
  ```

* `400 Bad Request` – missing data

* `401 Unauthorized` – invalid credentials

* `500 Internal Server Error` – unexpected error

---

## Manual Testing (without frontend)

After starting the Flask app (`python backend/app.py`):

### Register

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }'
```

Expected:

* Status: `201 Created`
* JSON:

  ```json
  {
    "userId": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
  ```

### Login (by username)

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'
```

### Login (by email)

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "123456"
  }'
```

Expected in both cases:

* Status: `200 OK`
* JSON with `userId`, `username`, `email`.

---

## Frontend Integration (for teammates)

The React frontend uses a small auth service to talk to this backend:

* File: `services/authService.ts` (in the frontend project)

* Base URL:

  ```ts
  const AUTH_BASE_URL = 'http://localhost:5000';
  ```

* Functions:

  * `registerUser(username, email, password)`
  * `loginUser(usernameOrEmail, password)`

The pages:

* `LoginPage.tsx`

  * Calls `loginUser`
  * On success, stores the user object in `localStorage` under `currentUser`
  * Redirects to the home page (`/`)

* `RegisterPage.tsx`

  * Calls `registerUser`
  * On success, shows a success message and redirects to `/login`

### End-to-end demo flow

1. Start PostgreSQL and initialize the DB:

   * `python backend/init_db.py`
2. Run the Flask backend:

   * `python backend/app.py`
3. (Optionally) start the FastAPI image service:

   * `uvicorn api.index:app --reload --port 8000`
4. Start the frontend:

   * `npm run dev`
5. In the browser:

   * Go to `/register`, create a new account.
   * Go to `/login`, log in with the new account.
   * On success, you are redirected to the home page and the user is saved in `localStorage`.

This demonstrates the full data flow:

> **UI → Backend → Database → Backend → UI**

---

## Troubleshooting

* **`Failed to fetch` in frontend**

  * Check that Flask is running on `http://localhost:5000/`.
  * Confirm `AUTH_BASE_URL` in `authService.ts` is correct.
  * Make sure `flask-cors` is installed and CORS is enabled in `app.py`.

* **Database connection errors**

  * Verify `DATABASE_URL` in `database.py`.
  * Confirm PostgreSQL service is running.
  * Ensure the database name, user, and password are correct.

* **Login always fails (`401 Unauthorized`)**

  * Confirm you registered the user successfully first.
  * Check that you are using the correct password.
  * Remember that the login field accepts **either username or email**, but both are passed as `username` in JSON.

If anything is unclear or breaks, please contact **Zhenyu** for backend auth-related questions.
