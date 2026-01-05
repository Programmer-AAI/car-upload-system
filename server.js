

const express = require('express');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'cars.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cookieParser());



// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Load cars from file
function loadCars() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

// Save cars to file
function saveCars(cars) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cars, null, 2));
}

// Load users from file
function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

// Simple in-memory session store
const sessions = {};

// Authentication middleware
function authMiddleware(req, res, next) {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessions[sessionId]) {
    req.user = sessions[sessionId];
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  console.log("user data")
  // const user = users.find(u => u.username === username);
  // if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // const match = await bcrypt.compare(password, user.passwordHash);
  // if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const sessionId = Date.now() + '-' + Math.random();
  sessions[sessionId] = { username };
  res.cookie('sessionId', sessionId, { httpOnly: true });
  res.json({ message: 'Logged in' });
});

// Logout route
app.post('/api/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) delete sessions[sessionId];
  res.clearCookie('sessionId');
  res.json({ message: 'Logged out' });
});

// Get all cars (public)
app.get('/api/cars', (req, res) => {
  console.log("hello")
  res.json(loadCars());
});

// Add new car (admin only)

app.post('/api/cars', upload.single('image'), (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image required' });
    }

    const cars = loadCars(); // 🔥 LOAD FIRST

    const newCar = {
      name,
      description,
      category,
      image: `/uploads/${req.file.filename}`
    };

    cars.push(newCar);        // ✅ SAFE
    saveCars(cars);           // ✅ SAFE

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete car (admin only)
app.delete('/api/cars/:index', authMiddleware, (req, res) => {
  const idx = parseInt(req.params.index);
  const cars = loadCars();
  if (isNaN(idx) || idx < 0 || idx >= cars.length) {
    return res.status(404).json({ message: 'Car not found' });
  }
  const removed = cars.splice(idx, 1);
  saveCars(cars);
  res.json({ message: 'Car deleted', car: removed[0] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
