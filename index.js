const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const dbFile = path.join(__dirname, 'users.db');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Could not open database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database:', dbFile);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'super-secret-login-session-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Create users table
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )`
);

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_ ]{3,30}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!username || !email || !password) {
    return res.redirect('/register?error=Please fill in all fields');
  }
  const cleanName = username.trim();
  if (!usernameRegex.test(cleanName)) {
    return res.redirect('/register?error=Name must be 3-30 characters and can include letters, numbers, spaces, underscores');
  }
  if (!emailRegex.test(email) || !email.includes('.')) {
    return res.redirect('/register?error=Please enter a valid email address');
  }
  if (!passwordRegex.test(password)) {
    return res.redirect('/register?error=Password must be 8+ chars, include upper/lowercase, number, and special char');
  }

  const hashed = await bcrypt.hash(password, 10);
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [cleanName, email.toLowerCase(), hashed],
    function (err) {
      if (err) {
        console.error(err);
        return res.redirect('/register?error=User or email already exists');
      }
      req.session.user = { id: this.lastID, username: cleanName, email: email.toLowerCase() };
      return res.redirect('/dashboard?success=Registration successful');
    }
  );
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) {
    return res.redirect('/login?error=Please fill in all fields');
  }
  if (!emailRegex.test(email) || !email.includes('.')) {
    return res.redirect('/login?error=Please enter a valid email address');
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, row) => {
    if (err) {
      console.error(err);
      return res.redirect('/login?error=Server error');
    }
    if (!row) {
      return res.redirect('/login?error=Invalid email or password');
    }
    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.redirect('/login?error=Invalid email or password');
    }
    req.session.user = { id: row.id, username: row.username, email: row.email };
    return res.redirect('/dashboard?success=Login successful');
  });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const success = req.query.success ? `<p style="color:#16a34a;font-weight:700;">${req.query.success}</p>` : '';
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dashboard</title><style>body{font-family:Arial;display:flex;align-items:center;justify-content:center;height:100vh;background:#f1f5f9} .box{background:#fff;padding:24px;border-radius:10px;box-shadow:0 0 12px rgba(0,0,0,.08);max-width:420px;text-align:left;}a{color:#0b5ed7;text-decoration:none;}</style></head><body><div class="box">${success}<h1>Welcome, ${req.session.user.username} 👋</h1><p>Your email: ${req.session.user.email || 'N/A'}</p><p><a href="/logout">Logout</a></p></div></body></html>`);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).send('Page not found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
