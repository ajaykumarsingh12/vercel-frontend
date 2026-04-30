import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import "../Auth.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setFormData({ email: "", password: "" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.user.role === "admin") {
        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Access denied. Admin access only.");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Admin Login</h2>
          <p>Login to admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="email">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="off"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Admin accounts can only be created by system administrators.
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link to="/" className="auth-link">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
