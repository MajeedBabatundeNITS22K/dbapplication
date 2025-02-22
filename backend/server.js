const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Create or connect to SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER,
            weight REAL,
            nationality TEXT
        )`, () => {
            insertDefaultUsers();
        });
    }
});

// ✅ Check and add missing columns
function checkAndAddMissingColumns() {
    db.all(`PRAGMA table_info(users)`, (err, columns) => {
        if (err) {
            console.error("Error checking table structure:", err);
            return;
        }

        const existingColumns = columns.map(col => col.name);

        if (!existingColumns.includes("age")) {
            db.run("ALTER TABLE users ADD COLUMN age INTEGER", () => console.log("✅ Added 'age' column."));
        }
        if (!existingColumns.includes("weight")) {
            db.run("ALTER TABLE users ADD COLUMN weight REAL", () => console.log("✅ Added 'weight' column."));
        }
        if (!existingColumns.includes("nationality")) {
            db.run("ALTER TABLE users ADD COLUMN nationality TEXT", () => console.log("✅ Added 'nationality' column."));
        }
    });
}

// ✅ Insert default users
function insertDefaultUsers() {
    const users = [
        { name: "Alice Johnson", email: "alice@example.com", age: 25, weight: 60.5, nationality: "American" },
        { name: "Bob Smith", email: "bob@example.com", age: 30, weight: 75.0, nationality: "British" },
        { name: "Majeed Babs", email: "majeed@example.com", age: 28, weight: 68.2, nationality: "Nigerian" }
    ];

    db.run("DELETE FROM users", () => {
        console.log("Cleared existing users.");

        const stmt = db.prepare('INSERT INTO users (name, email, age, weight, nationality) VALUES (?, ?, ?, ?, ?)');
        users.forEach(user => {
            stmt.run(user.name, user.email, user.age, user.weight, user.nationality);
        });
        stmt.finalize();
        console.log("Inserted default users into the database.");
    });
}

// ✅ Serve the `index.html` file at root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ API Endpoints
app.post('/add-user', (req, res) => {
    const { name, email, age, weight, nationality } = req.body;
    db.run(
        'INSERT INTO users (name, email, age, weight, nationality) VALUES (?, ?, ?, ?, ?)',
        [name, email, age, weight, nationality],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID, message: "User added successfully" });
            }
        }
    );
});

app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.put('/update-user/:id', (req, res) => {
    const { name, email, age, weight, nationality } = req.body;
    db.run(
        'UPDATE users SET name = ?, email = ?, age = ?, weight = ?, nationality = ? WHERE id = ?',
        [name, email, age, weight, nationality, req.params.id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: "User not found" });
            } else {
                res.json({ updatedID: req.params.id, message: "User updated successfully" });
            }
        }
    );
});

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
