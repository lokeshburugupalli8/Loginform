# Login/Register App (Node + Express + SQLite)

A simple Node.js authentication app with registration and login using SQLite, session-based auth, and frontend validation.

## Features

- Register new users with username, email, and password
- Strong password validation (uppercase, lowercase, number, special char, 8+ chars)
- Email validation with dot-check
- Login with email and password
- Bcrypt password hashing
- Session-based dashboard protected route
- Basic client-side validation + server-side validation
- SQLite storage

## Project Structure

```
.
├── index.js
├── package.json
├── package-lock.json
├── users.db
├── public
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   └── styles.css
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open in browser:

- `http://localhost:3000` for homepage
- `http://localhost:3000/register` for registration
- `http://localhost:3000/login` for login

## Validation Rules

### Register
- Username: 3-30 chars, letters/numbers/spaces/underscore
- Email: valid format must include `@` and `.`
- Password: minimum 8 chars, includes uppercase, lowercase, number, and special character

### Login
- Email: valid format
- Password: required

## Routes

- GET `/` - Welcome page
- GET `/register` - Registration form
- POST `/register` - Register user with validation
- GET `/login` - Login form
- POST `/login` - Authenticate user
- GET `/dashboard` - Protected dashboard
- GET `/logout` - End session

## Notes

- Do not use VS Code Live Server for route flow. Use Node server `npm start`.
- `users.db` is created automatically on first run.
- To reset users, delete `users.db` and restart.

## Improve further

- Add proper templating (EJS/Pug) to avoid inlined HTML.
- Move frontend JavaScript into separate file.
- Add password reset and email verification.
- Use production session store (Redis) and HTTPS for deployment.
