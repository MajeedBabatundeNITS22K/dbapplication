const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Create or connect to SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');

        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )`, () => {
            insertDefaultUsers();
        });
    }
});

// Function to insert default users (Force insert every restart)
function insertDefaultUsers() {
    const users = [
        { name: "Alice Johnson", email: "alice@example.com" },
        { name: "Bob Smith", email: "bob@example.com" },
        { name: "Charlie Brown", email: "charlie@example.com" }
    ];

    // Clear existing users (if any)
    db.run("DELETE FROM users", () => {
        console.log("Cleared existing users.");

        const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        users.forEach(user => {
            stmt.run(user.name, user.email);
        });
        stmt.finalize();
        console.log("Inserted default users into the database.");
    });
}

// ✅ Homepage route to fix "Cannot GET /"
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the SQLite User API</h1><p>Use <a href="/users">/users</a> to see all users.</p>');
});

// ✅ Add a new user
app.post('/add-user', (req, res) => {
    const { name, email } = req.body;
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// ✅ Get all users
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// ✅ Delete a user
app.delete('/delete-user/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', req.params.id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ deletedID: req.params.id });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
