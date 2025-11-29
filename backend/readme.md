# Backend Auth Service

This folder contains the **Flask-based authentication backend** for the IdIt project.

The backend is deployed on Render and connects to a remote PostgreSQL database.  
It is responsible for:

- Registering new users
- Authenticating existing users
- Storing and validating credentials in PostgreSQL

---

## What the backend does

### Endpoints

All endpoints are exposed under the Render base URL:

```text
https://idit.onrender.com
````

#### `POST /api/register`

* Creates a new user account.
* Hashes the password using `bcrypt`.
* Stores a new record in the `users` table.
* Creates an associated `credit_accounts` record.

**Request body (JSON):**

```json
{
  "username": "demo_user",
  "email": "demo@example.com",
  "password": "Secret123"
}
```

**Successful response (`201 Created`):**

```json
{
  "userId": "uuid-string",
  "username": "demo_user",
  "email": "demo@example.com"
}
```

---

#### `POST /api/login`

* Authenticates an existing user.
* Accepts either **username or email** in the `username` field.
* Verifies the password using `bcrypt` against the stored hash.
* Returns basic user info on success.

**Request body (JSON):**

```json
{
  "username": "demo_user",
  "password": "Secret123"
}
```

**Successful response (`200 OK`):**

```json
{
  "userId": "uuid-string",
  "username": "demo_user",
  "email": "demo@example.com"
}
```

---

### Health check

The root route is a simple health check:

```text
GET https://idit.onrender.com/
```

Expected JSON:

```json
{"status": "ok", "message": "Auth backend is running"}
```

---

## How the backend is wired

### Tech stack

* **Flask** – request handling
* **Flask-CORS** – CORS configuration for frontend integration
* **SQLAlchemy** – ORM and DB sessions
* **PostgreSQL** – remote database (hosted externally)
* **psycopg2-binary** – PostgreSQL driver
* **bcrypt** – password hashing and verification
* **gunicorn** – WSGI server on Render

### Key files

All paths are relative to `backend/`:

* `app.py`

  * Flask app factory and entry point
  * Registers the authentication blueprint
  * Configures CORS using the `FRONTEND_ORIGINS` environment variable
  * Exposes the health check route `/`

* `auth_routes.py`

  * Implements:

    * `POST /api/register`
    * `POST /api/login`
  * Uses SQLAlchemy sessions from `database.py`
  * Uses `User` and `CreditAccount` models from `models.py`
  * Uses `bcrypt` helpers from `security.py`

* `database.py`

  * Reads `DATABASE_URL` from environment
  * Creates the SQLAlchemy `engine`, `SessionLocal`, and `Base`

* `models.py`

  * `User` model:

    * `user_id` (UUID primary key)
    * `username` (unique)
    * `email` (unique)
    * `password_hash`
    * timestamps
  * `CreditAccount` model:

    * `account_id` (UUID primary key)
    * `user_id` (FK to `User`, one-to-one)
    * `balance` (integer, default 0)

* `security.py`

  * `hash_password(plain_password: str) -> str`
  * `verify_password(plain_password: str, hashed_password: str) -> bool`

* `init_db.py`

  * One-shot script used to initialize the **remote** PostgreSQL schema
  * Uses the same `DATABASE_URL` as the deployed backend
  * Creates:

    * `users` table
    * `credit_accounts` table

---

## Deployment configuration (Render)

The auth backend is deployed as a Web Service on Render and started with:

```bash
gunicorn "backend.app:app" --bind 0.0.0.0:$PORT
```

### Environment variables (Render)

* `DATABASE_URL`

  * PostgreSQL connection string for the remote database.
  * Example:

    ```text
    postgresql://user:password@host:5432/database_name
    ```

* `FRONTEND_ORIGINS`

  * Comma-separated list of allowed frontend origins for CORS.
  * Example:

    ```text
    http://localhost:5173,https://idit-git-main-wusangggs-projects.vercel.app
    ```

The same `DATABASE_URL` was used with `init_db.py` to create the tables in the remote database.

---

## How to verify the backend (directly)

You can verify the deployed backend directly using `curl` or any HTTP client.

### 1. Check health

```bash
curl https://idit.onrender.com/
```

Expected:

```json
{"status":"ok","message":"Auth backend is running"}
```

### 2. Register a user (remote DB)

```bash
curl -X POST https://idit.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@example.com",
    "password": "Secret123"
  }'
```

Expected:

* HTTP status `201 Created`
* Response JSON containing `userId`, `username`, and `email`.

### 3. Log in with the same user

```bash
curl -X POST https://idit.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "password": "Secret123"
  }'
```

or using email:

```bash
curl -X POST https://idit.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo@example.com",
    "password": "Secret123"
  }'
```

Expected:

* HTTP status `200 OK`
* Response JSON with the same user information.

All of these operations are executed against the **remote PostgreSQL database** used by the deployed backend.

---

## How to verify the backend via the frontend

The deployed frontend is available at:

```text
https://idit-git-main-wusangggs-projects.vercel.app
```

### End-to-end flow

1. Open the frontend URL in a browser.
2. Navigate to the **Register** page:

   * Fill in username, email, and password.
   * Submit the form.
   * The frontend calls `POST https://idit.onrender.com/api/register`.
3. Navigate to the **Login** page:

   * Enter the same credentials.
   * The frontend calls `POST https://idit.onrender.com/api/login`.
   * On success, the frontend stores the returned user in `localStorage.currentUser` and redirects to the home page.

This demonstrates the full pipeline:

> Browser → Vercel frontend → Render auth backend → remote PostgreSQL → back to frontend.
