import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./Auth.css";

const Login = () => {
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
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState("");
  const [unblockRequestSent, setUnblockRequestSent] = useState(false);
  const { login, verifyEmailExists, resetPassword, googleLogin, appleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setFormData({ email: "", password: "" });

    // Load Google Sign-In script
    const googleScript = document.createElement('script');
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    document.body.appendChild(googleScript);

    googleScript.onload = () => {
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '274529260120-odem5g4vkc4qppt86s4n3vcs5e5h56kd.apps.googleusercontent.com';
        console.log('🔑 Google Client ID:', clientId);
        console.log('🌍 Environment:', import.meta.env.MODE);
        console.log('📦 All VITE vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
      }
    };

    // Load Apple Sign-In script
    const appleScript = document.createElement('script');
    appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    appleScript.async = true;
    appleScript.defer = true;
    document.body.appendChild(appleScript);

    appleScript.onload = () => {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.yourdomain.bookmyhall.web',
          scope: 'name email',
          redirectURI: window.location.origin,
          usePopup: true,
        });
      }
    };

    return () => {
      if (document.body.contains(googleScript)) {
        document.body.removeChild(googleScript);
      }
      if (document.body.contains(appleScript)) {
        document.body.removeChild(appleScript);
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    const result = await googleLogin(response.credential);

    if (result.success) {
      toast.success("Google login successful!");
      const currentUser = result.user;

      if (location.state?.from) {
        navigate(location.state.from);
      } else if (currentUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (currentUser.role === "hall_owner") {
        navigate("/hall-owner/dashboard");
      } else {
        navigate("/");
      }
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast.error("Google Sign-In not loaded. Please refresh the page.");
    }
  };

  const handleAppleLogin = async () => {
    try {
      if (!window.AppleID) {
        toast.error("Apple Sign-In not available. Please try another method.");
        return;
      }

      const data = await window.AppleID.auth.signIn();

      setLoading(true);
      const result = await appleLogin(data.authorization.id_token, data.user);

      if (result.success) {
        toast.success("Apple login successful!");
        const currentUser = result.user;

        if (location.state?.from) {
          navigate(location.state.from);
        } else if (currentUser.role === "admin") {
          navigate("/admin/dashboard");
        } else if (currentUser.role === "hall_owner") {
          navigate("/hall-owner/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      if (error.error !== 'popup_closed_by_user') {
        toast.error("Apple login failed. Please try again.");
      }
      setLoading(false);
    }
  };

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
      // Check if email exists in the database
      const result = await verifyEmailExists(forgotPasswordEmail.trim());

      if (result.success && result.exists) {
        // Email exists, show new password form
        setShowNewPasswordForm(true);
        toast.success("Email verified! Please set your new password.");
      } else if (result.success && !result.exists) {
        // Email doesn't exist
        toast.error("Email not found. Please check your email address or register for a new account.");
      } else {
        // API call failed
        toast.error("Failed to verify email. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify email. Please try again.");
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
      // Call API to reset password
      const result = await resetPassword(forgotPasswordEmail.trim(), newPasswordData.newPassword);

      if (result.success) {
        toast.success("Password reset successful! You can now login with your new password.");
        closeForgotPasswordModal();
      } else {
        toast.error(result.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset password. Please try again.");
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
    setIsBlocked(false);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success("Login successful!");
      const currentUser = result.user;

      // Check if there's a return url
      if (location.state?.from) {
        navigate(location.state.from);
      } else if (currentUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (currentUser.role === "hall_owner") {
        navigate("/hall-owner/dashboard");
      } else {
        navigate("/");
      }
    } else {
      // Check if user is blocked
      if (result.isBlocked) {
        setIsBlocked(true);
        setBlockedEmail(formData.email);
        toast.error(result.message);
      } else {
        toast.error(result.message);
      }
    }

    setLoading(false);
  };

  const handleRequestUnblock = async () => {
    try {
      setLoading(true);
      // Send unblock request to admin
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/request-unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: blockedEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setUnblockRequestSent(true);
        toast.success("Unblock request sent to admin successfully!");
      } else {
        toast.error(data.message || "Failed to send unblock request");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send unblock request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
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
          
          {/* Blocked User Message */}
          {isBlocked && (
            <div className="blocked-user-alert">
              <div className="blocked-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </div>
              <div className="blocked-content">
                <h4>Account Blocked</h4>
                <p>Your account has been blocked by the administrator. Please request to unblock your account.</p>
                {!unblockRequestSent ? (
                  <button 
                    type="button" 
                    className="btn-request-unblock" 
                    onClick={handleRequestUnblock}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Request Unblock
                      </>
                    )}
                  </button>
                ) : (
                  <div className="request-sent-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Request sent! Admin will review your request.</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button type="submit" className="btn-auth-submit" disabled={loading || isBlocked}>
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
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>

        {/* Social Login Section */}
        <div className="social-login-section">
          <div className="divider">
            <span>Or With</span>
          </div>
          <div className="social-buttons">
            <button type="button" className="btn-social btn-google" onClick={handleGoogleLogin} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button type="button" className="btn-social btn-apple" onClick={handleAppleLogin} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showNewPasswordForm ? "Set New Password" : "Reset Password"}</h3>
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
                  Enter your email address to verify your account and reset your password.
                </p>
                <div className="form-group">
                  <label htmlFor="forgot-email">
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
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email address"
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
                      "Verify Email"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNewPasswordSubmit} className="modal-form">
                <p className="modal-description">
                  Email verified for: <strong>{forgotPasswordEmail}</strong><br />
                  Please enter your new password below.
                </p>
                <div className="form-group">
                  <label htmlFor="new-password">
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
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    name="newPassword"
                    value={newPasswordData.newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter your new password"
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
                  <label htmlFor="confirm-new-password">
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
                    id="confirm-new-password"
                    type="password"
                    name="confirmNewPassword"
                    value={newPasswordData.confirmNewPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Confirm your new password"
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
                      "Update Password"
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

export default Login;
