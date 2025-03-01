import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', age: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/add-user', formData);
            setFormData({ name: '', email: '', age: '' });
            fetchUsers();
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/delete-user/${id}`);
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center text-primary">User Management System</h2>

            <form onSubmit={handleSubmit} className="mb-4">
                <input className="form-control mb-2" type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                <input className="form-control mb-2" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input className="form-control mb-2" type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} />
                <button className="btn btn-primary w-100" type="submit">Add User</button>
            </form>

            <table className="table table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.age}</td>
                            <td>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;