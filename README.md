# Node.js Web Service/API + Socket.IO Assignment

A deployment-ready solution for both assignment tasks:

1. **JSON web service/API using Node.js + MongoDB**
   - Creates users with nested address data.
   - Validates mobile, email, login ID, and password.
   - Automatically stores `createdAt` and `updatedAt`.
   - Includes a jQuery/AJAX form to save users.
   - Includes a jQuery/AJAX page to read and display MongoDB records.

2. **Socket.IO operations**
   - After a user is inserted, the browser emits `join-live-users`.
   - The server joins that socket to the room `live_users`.
   - A local `Map` stores user ID, email, name, and socket ID.
   - The connected-user list updates in real time.
   - Clicking a live entry calls `GET /api/users/:id` and shows user details in a popup.

## Security note

Passwords are validated and then stored as a salted Node.js `scrypt` hash. The password/hash is never returned by the read APIs or shown in the popup.

## Pages

- `/` — create user using jQuery/AJAX and join the live room
- `/users.html` — read all MongoDB records using jQuery/AJAX
- `/live-users.html` — real-time connected users
- `/api/health` — deployment health check

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/users` | Validate and create a user |
| GET | `/api/users` | Return all users |
| GET | `/api/users/:id` | Return one user for the popup |
| GET | `/api/health` | Confirm app/database status |

## Run locally

### 1. Install Node.js

Use Node.js 18 or newer.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure MongoDB

Copy the environment template:

```bash
cp .env.example .env
```

Put your MongoDB Atlas connection string in `.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/node_assignment?retryWrites=true&w=majority
```

If the MongoDB password contains special URL characters such as `@`, `/`, `:` or `#`, URL-encode the password.

### 4. Start

```bash
npm start
```

Open `http://localhost:3000`.

### 5. Run validation tests

```bash
npm test
```

## Make the site live using MongoDB Atlas + Render

### A. MongoDB Atlas

1. Create an Atlas project and database cluster.
2. Under **Database Access**, create a database user.
3. Under **Network Access**, add the outbound IP range required by your host. For a quick demonstration, Atlas allows `0.0.0.0/0`, but use a restricted range for production.
4. Copy the application connection string and replace the username/password/database name.

### B. GitHub

Create a repository and upload all project files. Do **not** upload `.env`.

### C. Render

1. In Render, choose **New → Web Service**.
2. Connect the GitHub repository.
3. Use:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variable `MONGODB_URI` with the Atlas connection string.
5. Deploy and open the generated `onrender.com` URL.

The included `render.yaml` can also be used for a Blueprint deployment.

## Demo checklist

1. Open the home page in Browser A.
2. Submit a valid user.
3. Confirm the success message contains a Socket.IO socket ID.
4. Open `/live-users.html` in Browser B and see Browser A's user in the room.
5. Click the user's email/socket entry and confirm the API-powered popup opens.
6. Open `/users.html` and confirm the MongoDB record is displayed.
7. Close Browser A and confirm the live user disappears in Browser B.

## Example valid input

- First name: `Jatin`
- Last name: `Agrawal`
- Mobile: `9876543210`
- Email: `jatin@example.com`
- Login ID: `Jatin123`
- Password: `Abc@12`
