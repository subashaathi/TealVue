import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../middleware/axios";
import "../styles/AdminDashboard.scss";
import { toast } from "react-toastify";

/* ---------------- TYPES ---------------- */
type TicketStatus = "open" | "inprogress" | "closed";

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
}

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    imageUrl?: string;
    user?: User;
}

/* ---------------- COMPONENT ---------------- */
const AdminDashboard = () => {
    const navigate = useNavigate();

    const [tab, setTab] = useState<"tickets" | "users">("users");

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const [userForm, setUserForm] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "user",
    });

    /* ---------------- STATUS MAP ---------------- */
    const STATUS_MAP: Record<TicketStatus, string> = {
        open: "Open",
        inprogress: "In Progress",
        closed: "Closed",
    };

    /* ---------------- USER INPUT ---------------- */
    const handleUserChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value,
        });
    };

    /* ---------------- TICKETS API ---------------- */
    const fetchTickets = async () => {
        try {
            const res = await axiosApi.get("/tickets");
            setTickets(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    const updateStatus = async (id: number, status: TicketStatus) => {
        try {
            await axiosApi.put(`/tickets/${id}/status`, { status });
            fetchTickets();
        } catch (err) {
            console.log(err);
        }
    };

    /* ---------------- USERS API ---------------- */
    const fetchUsers = async () => {
        try {
            const res = await axiosApi.get("/users");
            setUsers(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axiosApi.post("/users", userForm);

            toast.success("User created successfully");

            setIsUserModalOpen(false);

            setUserForm({
                name: "",
                username: "",
                email: "",
                password: "",
                role: "user",
            });

            fetchUsers();
        } catch (err) {
            toast.error("User creation failed");
        }
    };

    /* ---------------- LOAD DATA ---------------- */
    useEffect(() => {
        fetchTickets();
        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="admin-wrapper">

            {/* HEADER */}
            <div className="admin-header">
                <h1>Admin Panel</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {/* TABS */}
            <div className="tabs">
                <button
                    className={tab === "users" ? "active" : ""}
                    onClick={() => setTab("users")}
                >
                    Users
                </button>

                <button
                    className={tab === "tickets" ? "active" : ""}
                    onClick={() => setTab("tickets")}
                >
                    Tickets
                </button>
            </div>

            {/* ---------------- TICKETS ---------------- */}
            {tab === "tickets" && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Image</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tickets.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td>{t.user?.username}</td>
                                    <td>{t.title}</td>

                                    {/* STATUS BADGE */}
                                    <td>
                                        <span className={`status ${t.status}`}>
                                            {t.status}
                                        </span>
                                    </td>

                                    {/* IMAGE */}
                                    <td>
                                        {t.imageUrl ? (
                                            <img
                                                src={`http://localhost:3000/uploads/${t.imageUrl}`}
                                                alt="ticket"
                                                className="ticket-image"
                                            />
                                        ) : (
                                            <span>No Image</span>
                                        )}
                                    </td>

                                    {/* STATUS UPDATE */}
                                    <td>
                                        <select
                                            value={t.status}
                                            onChange={(e) =>
                                                updateStatus(
                                                    t.id,
                                                    e.target.value as TicketStatus
                                                )
                                            }
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---------------- USERS ---------------- */}
            {tab === "users" && (
                <div className="table-container">

                    <div className="top-bar">
                        <button onClick={() => setIsUserModalOpen(true)}>
                            + Add User
                        </button>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.name}</td>
                                    <td>{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---------------- USER MODAL ---------------- */}
            {isUserModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">

                        <h2>Create User</h2>

                        <form onSubmit={handleCreateUser}>

                            <input
                                name="name"
                                placeholder="Name"
                                value={userForm.name}
                                onChange={handleUserChange}
                                required
                            />

                            <input
                                name="username"
                                placeholder="Username"
                                value={userForm.username}
                                onChange={handleUserChange}
                                required
                            />

                            <input
                                name="email"
                                placeholder="Email"
                                value={userForm.email}
                                onChange={handleUserChange}
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={userForm.password}
                                onChange={handleUserChange}
                                required
                            />

                            <select
                                name="role"
                                value={userForm.role}
                                onChange={handleUserChange}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                            <div className="modal-actions">
                                <button type="submit">Create</button>
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;