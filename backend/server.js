const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Error opening database:", err);
    } else {
        console.log("Connected to SQLite database");

        // Create users table if it doesn’t exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER
        )`);
    }
});

// ✅ Add a new user
app.post('/add-user', (req, res) => {
    const { name, email, age } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required!" });
    }

    db.run('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', [name, email, age], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: "User added successfully" });
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
            res.json({ deletedID: req.params.id, message: "User deleted successfully" });
        }
    });
});
// ✅ Start the server
app.listen(port, () => {
    console.log(`🔥 Server running at http://localhost:${port}`);
});
