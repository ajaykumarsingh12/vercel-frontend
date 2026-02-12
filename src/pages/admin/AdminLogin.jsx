import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import "../Auth.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({
    newPassword: "",
    confirmNewPassword: ""
  });
  const [newPasswordErrors, setNewPasswordErrors] = useState({});
  const { login, verifyEmailExists, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setFormData({ email: "", password: "" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 3) return { strength: score, text: 'Weak', color: '#e74c3c' };
    if (score < 4) return { strength: score, text: 'Fair', color: '#f39c12' };
    if (score < 5) return { strength: score, text: 'Good', color: '#27ae60' };
    return { strength: score, text: 'Strong', color: '#27ae60' };
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setForgotPasswordLoading(true);

    try {
      // Check if admin email exists in the database
      const result = await verifyEmailExists(forgotPasswordEmail.trim());

      if (result.success && result.exists) {
        // Email exists, show new password form
        setShowNewPasswordForm(true);
        toast.success("Admin email verified! Please set your new password.");
      } else {
        // Email doesn't exist or not an admin
        toast.error("Admin email not found. Please check your email address or contact system administrator.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify admin email. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleNewPasswordChange = (e) => {
    const { name, value } = e.target;
    setNewPasswordData({ ...newPasswordData, [name]: value });

    // Clear error when user starts typing
    if (newPasswordErrors[name]) {
      setNewPasswordErrors({ ...newPasswordErrors, [name]: null });
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate new password
    const errors = {};

    const passwordError = validatePassword(newPasswordData.newPassword);
    if (passwordError) {
      errors.newPassword = passwordError;
    }

    if (!newPasswordData.confirmNewPassword) {
      errors.confirmNewPassword = "Please confirm your new password";
    } else if (newPasswordData.newPassword !== newPasswordData.confirmNewPassword) {
      errors.confirmNewPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setNewPasswordErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }

    setForgotPasswordLoading(true);

    try {
      // Call API to reset admin password
      const result = await resetPassword(forgotPasswordEmail.trim(), newPasswordData.newPassword);

      if (result.success) {
        toast.success("Admin password reset successful! You can now login with your new password.");
        closeForgotPasswordModal();
      } else {
        toast.error(result.message || "Failed to reset admin password. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset admin password. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setShowNewPasswordForm(false);
    setForgotPasswordEmail("");
    setNewPasswordData({ newPassword: "", confirmNewPassword: "" });
    setNewPasswordErrors({});
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="forgot-password-btn"
            >
              Forgot Password?
            </button>
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
            <Link to="/" className="auth-link">
              Back to Home
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showNewPasswordForm ? "Set New Admin Password" : "Reset Admin Password"}</h3>
              <button
                className="modal-close-btn"
                onClick={closeForgotPasswordModal}
                type="button"
              >
                ×
              </button>
            </div>

            {!showNewPasswordForm ? (
              <form onSubmit={handleForgotPassword} className="modal-form">
                <p className="modal-description">
                  Enter your admin email address to verify your account and reset your password.
                </p>
                <div className="form-group">
                  <label htmlFor="admin-forgot-email">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Admin Email Address
                  </label>
                  <input
                    id="admin-forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your admin email address"
                    required
                    disabled={forgotPasswordLoading}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="btn-modal-cancel"
                    disabled={forgotPasswordLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-submit"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <span className="spinner"></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify Admin Email"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNewPasswordSubmit} className="modal-form">
                <p className="modal-description">
                  Admin email verified for: <strong>{forgotPasswordEmail}</strong><br />
                  Please enter your new admin password below.
                </p>
                <div className="form-group">
                  <label htmlFor="admin-new-password">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    New Admin Password
                  </label>
                  <input
                    id="admin-new-password"
                    type="password"
                    name="newPassword"
                    value={newPasswordData.newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter your new admin password"
                    required
                    disabled={forgotPasswordLoading}
                    className={newPasswordErrors.newPassword ? 'error' : ''}
                  />
                  {newPasswordData.newPassword && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${(getPasswordStrength(newPasswordData.newPassword).strength / 5) * 100}%`,
                            backgroundColor: getPasswordStrength(newPasswordData.newPassword).color
                          }}
                        ></div>
                      </div>
                      <span
                        className="strength-text"
                        style={{ color: getPasswordStrength(newPasswordData.newPassword).color }}
                      >
                        {getPasswordStrength(newPasswordData.newPassword).text}
                      </span>
                    </div>
                  )}
                  {newPasswordErrors.newPassword && (
                    <span className="error-message">{newPasswordErrors.newPassword}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="admin-confirm-new-password">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Confirm New Password
                  </label>
                  <input
                    id="admin-confirm-new-password"
                    type="password"
                    name="confirmNewPassword"
                    value={newPasswordData.confirmNewPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Confirm your new admin password"
                    required
                    disabled={forgotPasswordLoading}
                    className={newPasswordErrors.confirmNewPassword ? 'error' : ''}
                  />
                  {newPasswordErrors.confirmNewPassword && (
                    <span className="error-message">{newPasswordErrors.confirmNewPassword}</span>
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowNewPasswordForm(false)}
                    className="btn-modal-cancel"
                    disabled={forgotPasswordLoading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-submit"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <span className="spinner"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Admin Password"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
