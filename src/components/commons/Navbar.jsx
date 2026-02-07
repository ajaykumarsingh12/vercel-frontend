import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Click outside to close functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container') && showProfileMenu && !isClosing) {
        setIsClosing(true);
        setTimeout(() => {
          setShowProfileMenu(false);
          setIsClosing(false);
        }, 300);
      }
    };

    // ESC key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showProfileMenu && !isClosing) {
        setIsClosing(true);
        setTimeout(() => {
          setShowProfileMenu(false);
          setIsClosing(false);
        }, 300);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showProfileMenu, isClosing]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.7,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 1,
      },
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const menuChildVariants = {
    hidden: {
      opacity: 0,
      y: -40,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 35,
        duration: 1,
      },
    },
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    if (showProfileMenu) {
      // If menu is open, close it with animation
      setIsClosing(true);
      setTimeout(() => {
        setShowProfileMenu(false);
        setIsClosing(false);
      }, 300);
    } else {
      // If menu is closed, open it
      setShowProfileMenu(true);
      setIsClosing(false);
    }
  };

  const handleMenuClick = (action) => {
    // Close menu with animation when clicking menu items
    setIsClosing(true);
    setTimeout(() => {
      setShowProfileMenu(false);
      setIsClosing(false);
    }, 300);

    if (action === "hall-owner-dashboard") {
      navigate("/hall-owner/dashboard");
    } else if (action === "my-halls") {
      navigate("/hall-owner/halls");
    } else if (action === "add-hall") {
      navigate("/hall-owner/halls/add");
    } else if (action === "edit-profile") {
      if (user?.role === "admin") {
        navigate("/admin/edit-profile");
      } else if (user?.role === "hall_owner") {
        navigate("/hall-owner/edit-profile");
      } else {
        navigate("/user/edit-profile");
      }
    } else if (action === "logout") {
      logout();
      navigate("/");
    }
  };

  const renderProfileMenu = () => (
    <div className={`profile-menu ${isClosing ? 'closing' : ''}`}>
      <div className="profile-info">
        <p className="owner-name">
          {isAuthenticated
            ? `Welcome, ${user?.name || "User"}!`
            : "Welcome to BookMyHall!"}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isAuthenticated && (
            <button
              className="header-theme-toggle"
              onClick={() => handleMenuClick("edit-profile")}
              aria-label="Edit Profile"
              title="Edit Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
          <button
            className="header-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 6.34-1.41-1.41"></path>
                <path d="m19.07 19.07-1.41-1.41"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="menu-items">
        {/* Show Browse Halls only for non-authenticated users (guests) */}
        {!isAuthenticated && (
          <>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/halls");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9v.01" />
                <path d="M9 12v.01" />
                <path d="M9 15v.01" />
                <path d="M9 18v.01" />
              </svg>
              Browse Halls
            </button>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/login");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10,17 15,12 10,7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Login
            </button>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/register");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
              Register
            </button>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/admin/login");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Admin
            </button>
            <hr className="menu-divider" />
          </>
        )}

        {isAuthenticated && user.role === "user" && (
          <>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/my-bookings");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              My Bookings
            </button>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/favorites");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              Favorites
            </button>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/reviews");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
              </svg>
              Reviews
            </button>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/payment");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              Payments
            </button>
            <hr className="menu-divider" />
          </>
        )}
        {isAuthenticated && user.role === "hall_owner" && (
          <>
            <button
              className="menu-item"
              onClick={() => handleMenuClick("hall-owner-dashboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </button>
            <button
              className="menu-item"
              onClick={() => handleMenuClick("my-halls")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-home h-6 w-6 text-primary"
                aria-hidden="true"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              My Halls
            </button>
            <button
              className="menu-item"
              onClick={() => handleMenuClick("add-hall")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Hall
            </button>
            <hr className="menu-divider" />
          </>
        )}
        {isAuthenticated && user.role === "admin" && (
          <>
            <button
              className="menu-item"
              onClick={() => {
                navigate("/admin/dashboard");
                setShowProfileMenu(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Admin Dashboard
            </button>
            <hr className="menu-divider" />
          </>
        )}
        {isAuthenticated && (
          <button
            className="menu-item logout-item"
            onClick={() => handleMenuClick("logout")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Logout
          </button>
        )}
      </div>
    </div>
  );

  return (
    <motion.nav
      className="navbar"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="navbar-container" variants={itemVariants}>


        <motion.div className="navbar-logo-wrapper" variants={itemVariants}>
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-home h-6 w-6 text-primary"
              aria-hidden="true"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            {/* <img src="public/images/logo5.png" alt=""/> */}
            <span>BookMyHall</span>
          </Link>
        </motion.div>

        <motion.ul
          className={`navbar-menu ${isMenuOpen ? "active" : ""}`}
          initial="hidden"
          animate="visible"
          variants={menuItemVariants}
        >
          {!isAuthenticated && (
            <>
              <motion.li variants={menuChildVariants}>
                <Link
                  to="/halls"
                  onClick={closeMenu}
                  className={isActive("/halls") ? "active" : ""}
                >
                  Browse Halls
                </Link>
              </motion.li>
              <motion.li variants={menuChildVariants}>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={isActive("/login") ? "active" : ""}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: "8px" }}
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10,17 15,12 10,7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Login
                </Link>
              </motion.li>
              <motion.li variants={menuChildVariants}>
                <Link
                  to="/register"
                  className={`btn-register ${isActive("/register") ? "active" : ""
                    }`}
                  onClick={closeMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: "8px" }}
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" y1="8" x2="19" y2="14"></line>
                    <line x1="22" y1="11" x2="16" y2="11"></line>
                  </svg>
                  Register
                </Link>
              </motion.li>
              <motion.li variants={menuChildVariants}>
                <Link
                  to="/admin/login"
                  onClick={closeMenu}
                  className={`btn-admin ${isActive("/admin/login") || isActive("/admin/register")
                    ? "active"
                    : ""
                    }`}
                >
                  Admin
                </Link>
              </motion.li>
            </>
          )}
        </motion.ul>

        {/* Desktop Right Container - profile */}
        <div className="desktop-right-container">
          <div className="profile-container">
            {isAuthenticated && user?.role === "user" && (
              <Link to="/halls" className="nav-icon-link" title="Browse Halls">
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
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9v.01" />
                  <path d="M9 12v.01" />
                  <path d="M9 15v.01" />
                  <path d="M9 18v.01" />
                </svg>
              </Link>
            )}
            <button className="profile-icon" onClick={toggleProfileMenu}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage.startsWith('http') ? user.profileImage : `/${user.profileImage}`}
                  alt="Profile"
                  className="profile-icon-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
              ) : null}
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
                style={{ display: user?.profileImage ? 'none' : 'block' }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            {showProfileMenu && renderProfileMenu()}
          </div>
        </div>
        <div className="mobile-profile-container">
          {isAuthenticated && user?.role === "user" && (
            <Link to="/halls" className="nav-icon-link" title="Browse Halls">
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
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9v.01" />
                <path d="M9 12v.01" />
                <path d="M9 15v.01" />
                <path d="M9 18v.01" />
              </svg>
            </Link>
          )}
          <button className="profile-icon" onClick={toggleProfileMenu}>
            {user?.profileImage ? (
              <img
                src={user.profileImage.startsWith('http') ? user.profileImage : `/${user.profileImage}`}
                alt="Profile"
                className="profile-icon-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
            ) : null}
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
              style={{ display: user?.profileImage ? 'none' : 'block' }}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          {showProfileMenu && renderProfileMenu()}
        </div>


      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
