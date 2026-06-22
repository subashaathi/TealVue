import React, { useEffect, useState } from "react";
import "../styles/UserDashboard.scss";
import axiosApi from "../middleware/axios";
import { toast } from "react-toastify";

const UserDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [image, setImage] = useState<File | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ✅ GET tickets by userId
    const fetchTickets = async (userId: number) => {
        try {
            setLoading(true);

            const response = await axiosApi.get(
                `/tickets/user/${userId}`
            );

            setTickets(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Load tickets on page load
    useEffect(() => {
        if (user?.id) {
            fetchTickets(user.id);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSubmitting(true); // 👈 start loading modal

        try {
            const data = new FormData();

            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("userId", user.id);

            if (image) {
                data.append("image", image);
            }

            const response = await axiosApi.post("/tickets", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Ticket created successfully");

            setFormData({
                title: "",
                description: "",
            });

            setImage(null);

            fetchTickets(user.id);

        } catch (error) {
            console.error(error);
            toast.error("Failed to create ticket");
        } finally {
            setIsSubmitting(false); // 👈 stop loading modal
        }
    };

    if (user.role !== "user") {
        return <h2>Access Denied</h2>;
    }
    

    return (

        <div className="user-dashboard">
            {isSubmitting && (
                <div className="loading-overlay">
                    <div className="loading-modal">
                        <div className="spinner"></div>
                        <p>Creating your ticket...</p>
                    </div>
                </div>
            )}

            {/* LEFT: CREATE TICKET */}
            <div className="ticket-card">
                <h2>Create Ticket</h2>


                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setImage(e.target.files ? e.target.files[0] : null)
                            }
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Create Ticket
                    </button>
                </form>
            </div>

            {/* RIGHT: TICKETS */}
            <div className="ticket-list">
                <div className="list-header">
                    <h2>Your Tickets</h2>
                    <span className="count">{tickets.length}</span>
                </div>

                {loading && <p className="loading">Loading tickets...</p>}

                {!loading && tickets.length === 0 && (
                    <p className="empty">No tickets found</p>
                )}

                {tickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card-item">
                        <div className="ticket-top">
                            <h3>{ticket.title}</h3>
                            <span className={`status ${ticket.status}`}>
                                {ticket.status}
                            </span>
                        </div>

                        <p className="desc">{ticket.description}</p>

                        {ticket.imageUrl && (
                            <img
                                src={`http://localhost:3000/uploads/${ticket.imageUrl}`}
                                alt="ticket"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserDashboard;