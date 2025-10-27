const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// --- 1. MIDDLEWARE SETUP ---

// Serve static files (index.html, styles.css, script.js) from the current directory
app.use(express.static(path.join(__dirname)));

// Middleware to parse JSON bodies (for API requests)
app.use(express.json());

// Middleware to parse URL-encoded bodies (for traditional form submissions, though JSON is better for APIs)
app.use(express.urlencoded({ extended: true }));


// --- 2. SIMULATED DATABASE (In-Memory Storage) ---

let users = [];
// Add a default test user
users.push({ 
    email: 'test@example.com', 
    password: 'password123', // In real life, HASH this password!
    username: 'testuser'
});


// --- 3. API ENDPOINTS ---

/**
 * @route POST /api/register
 * @desc Handles new user registration
 */
app.post('/api/register', (req, res) => {
    const { email, username, password } = req.body;

    // Basic validation
    if (!email || !username || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    // Add new user (In a real app, HASH the password before storing)
    const newUser = { email, username, password };
    users.push(newUser);
    
    console.log(`New user registered: ${username}`);
    // console.log('Current users:', users); // For debugging

    // Respond to the client
    res.status(201).json({ 
        success: true, 
        message: 'Registration successful!',
        user: { username: newUser.username, email: newUser.email }
    });
});

/**
 * @route POST /api/login
 * @desc Handles user login
 */
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = users.find(u => u.email === email);

    // Check credentials (In a real app, compare HASHED passwords)
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Successful login
    console.log(`User logged in: ${user.username}`);
    
    // Respond with a success message (In a real app, you would send a JWT/session token)
    res.status(200).json({ 
        success: true, 
        message: 'Login successful!',
        user: { username: user.username, email: user.email }
    });
});

// --- 4. DEFAULT ROUTE (Serves the HTML file) ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- 5. START SERVER ---
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log('API Endpoints are ready: /api/login and /api/register');
});