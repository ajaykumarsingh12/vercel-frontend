import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (user?.role === "hall_owner") {
    return (
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link
            to="/hall-owner/dashboard"
            className={isActive("/hall-owner/dashboard") ? "active" : ""}
          >
            Dashboard
          </Link>
          <Link
            to="/hall-owner/halls"
            className={isActive("/hall-owner/halls") ? "active" : ""}
          >
            My Halls
          </Link>
          <Link
            to="/hall-owner/halls/add"
            className={isActive("/hall-owner/halls/add") ? "active" : ""}
          >
            Add Hall
          </Link>
        </nav>
      </aside>
    );
  }

  return null;
};

export default Sidebar;
