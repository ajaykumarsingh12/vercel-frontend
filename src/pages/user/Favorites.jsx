import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/commons/Loader";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./Favorites.css";

const Favorites = () => {
  const { user, toggleFavorite, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, user?.favorites]); // Refetch if favorites array changes

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/halls/favorites/all");
      setFavorites(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>My Favorite Halls</h1>
        <p>Keep track of the venues you love most for your special day.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="no-favorites">
          <div className="no-favorites-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h3>Your favorites list is empty</h3>
          <p>
            Browse through our exquisite halls and click the heart icon to save
            them here.
          </p>
          <Link to="/halls" className="btn-browse">
            Browse All Halls
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((hall) => (
            <div key={hall._id} className="favorite-card">
              <div className="favorite-image-wrapper">
                {hall.images && hall.images.length > 0 ? (
                  <img
                    src={
                      hall.images[0].startsWith('http')
                        ? hall.images[0]
                        : `http://localhost:5000/${hall.images[0]}`
                    }
                    alt={hall.name}
                    className="favorite-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="favorite-image-placeholder">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <button
                  className="remove-favorite-btn"
                  onClick={() => {
                    if (user.role !== "user") {
                      toast.info("Only users can manage favorites");
                      return;
                    }
                    toggleFavorite(hall._id);
                  }}
                  title="Remove from favorites"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
                <div className="favorite-price-badge">
                  ₹{hall.pricePerHour}/hr
                </div>
              </div>

              <div className="favorite-content">
                <h3>{hall.name}</h3>
                <div className="favorite-info">
                  <div className="info-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="3">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>
                      {hall.location.city}, {hall.location.state}
                    </span>
                  </div>
                  <div className="info-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="blue"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span>{hall.capacity} people</span>
                  </div>
                </div>
                <Link to={`/halls/${hall._id}`} className="btn-view">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
