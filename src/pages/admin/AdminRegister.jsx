import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "../Auth.css";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    if (email.length > 100) {
      return "Email must be less than 100 characters";
    }
    return null;
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

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) {
      return "Phone number is required for admin registration";
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if it's a valid length (10 digits)
    if (cleanPhone.length !== 10) {
      return "Phone number must be 10 digits";
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    // Format phone number as user types
    if (name === 'phone') {
      // Remove all non-digit characters
      const cleanValue = value.replace(/\D/g, '');

      // Limit to 10 digits
      if (cleanValue.length > 10) return;

      // Format as Indian mobile number: XXXXX XXXXX
      let formattedValue = cleanValue;
      if (cleanValue.length > 5) {
        formattedValue = `${cleanValue.slice(0, 5)} ${cleanValue.slice(5, 10)}`;
      }

      setFormData({ ...formData, [name]: formattedValue });
    } else if (name === 'name') {
      // Prevent numbers and special characters except spaces, hyphens, and apostrophes
      const cleanValue = value.replace(/[^a-zA-Z\s'-]/g, '');
      setFormData({ ...formData, [name]: cleanValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Validate field on blur for immediate feedback
    let error = null;

    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        if (!value) {
          error = "Please confirm your password";
        } else if (formData.password !== value) {
          error = "Passwords do not match";
        }
        break;
      case 'phone':
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }

    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};

    // Validate name
    const nameError = validateName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate phone number (required for admin)
    const phoneError = validatePhoneNumber(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Show first error in toast
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);

    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.replace(/\D/g, ''), // Clean phone number
      password: formData.password,
      role: "admin",
    };

    try {
      const result = await register(registrationData);
      if (result && result.success) {
        toast.success("Admin registration successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error(
          result?.message ||
          (result?.errors?.[0]?.msg
            ? result.errors[0].msg
            : "Registration failed")
        );
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Admin Registration</h2>
          <p>Book your perfect wedding hall in minutes</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="adminreg-name">
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Full Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              id="adminreg-name"
              name="name"
              type="text"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="new-name"
              value={formData.name}
              disabled={loading}
              placeholder="Enter your full name"
              maxLength={50}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="adminreg-email">
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
              Email Address <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              id="adminreg-email"
              name="email"
              type="email"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="new-email"
              value={formData.email}
              disabled={loading}
              placeholder="Enter your email address"
              maxLength={100}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="adminreg-phone">
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
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Phone Number <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                padding: '1rem 0.75rem',
                border: '2px solid var(--input-border)',
                borderRadius: '10px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
                fontSize: '1rem',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                +91
              </span>
              <input
                id="adminreg-phone"
                name="phone"
                type="tel"
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="new-phone"
                value={formData.phone}
                disabled={loading}
                placeholder="98765 43210"
                maxLength={11}
                className={errors.phone ? 'error' : ''}
                style={{ flex: 1 }}
              />
            </div>
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="adminreg-password">
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
              Password <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              id="adminreg-password"
              name="password"
              type="password"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              value={formData.password}
              disabled={loading}
              placeholder="Must contain uppercase, lowercase, and number"
              className={errors.password ? 'error' : ''}
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(getPasswordStrength(formData.password).strength / 5) * 100}%`,
                      backgroundColor: getPasswordStrength(formData.password).color
                    }}
                  ></div>
                </div>
                <span
                  className="strength-text"
                  style={{ color: getPasswordStrength(formData.password).color }}
                >
                  {getPasswordStrength(formData.password).text}
                </span>
              </div>
            )}
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="adminreg-confirmPassword">
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
              Confirm Password <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              id="adminreg-confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              disabled={loading}
              placeholder="Re-enter your password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Registering...
              </>
            ) : (
              "Create Admin Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
