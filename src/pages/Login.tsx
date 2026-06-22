import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.scss";
import axiosApi from "../middleware/axios";

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axiosApi.post(
                "/auth/login",
                {
                    username,
                    password,
                }
            );

            const user = response.data.data;

            localStorage.setItem("user", JSON.stringify(user));

            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/user/dashboard");
            }
        } catch (error) {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <form className="login-form" onSubmit={handleLogin}>
                    <h2>Welcome Back</h2>
                    <p className="subtitle">Login to continue</p>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                        />
                    </div>

                    <button type="submit">Login</button>

                    <div className="footer-text">
                        <span>Secure Login • Ticket System</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;