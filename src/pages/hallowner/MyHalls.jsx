import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import HallCardSkeleton from "../../components/commons/HallCardSkeleton";
import "./MyHalls.css";

const MyHallCard = ({ hall, handleDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    hall.images && hall.images.length > 0
      ? hall.images.map((img) =>
        img.startsWith("http")
          ? img
          : `http://localhost:5000/${img}`
      )
      : [
        "https://images.unsplash.com/photo-5197411497674-611481863552?w=400&h=250&fit=crop&crop=center",
      ];

  const handleEditClick = (e) => {
    e.preventDefault();
    window.location.href = `/hall-owner/halls/edit/${hall._id}`;
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div key={hall._id} className="hall-card">
      <div className="hall-card-header">
        <div className="hall-image-container">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={hall.name}
              className="hall-image"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop&crop=center";
              }}
            />
          </AnimatePresence>
          <div className="image-overlay"></div>

          {images.length > 1 && (
            <>
              <button
                className="carousel-control prev"
                onClick={prevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="carousel-control next"
                onClick={nextImage}
                aria-label="Next image"
              >
                ›
              </button>
              <div className="carousel-indicators">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`indicator-dot ${index === currentImageIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <div className="image-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.828 14.828a4 4 0 0 1-5.656 0"></path>
              <path d="M9 10h1.586a1 1 0 0 1 .707.293l.707.707A1 1 0 0 0 13.414 11H15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"></path>
            </svg>
            {currentImageIndex === 0 ? "Main Photo" : `Photo ${currentImageIndex + 1}`}
          </div>
          {images.length > 1 && (
            <div className="photo-count">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.828 14.828a4 4 0 0 1-5.656 0"></path>
                <path d="M9 10h1.586a1 1 0 0 1 .707.293l.707.707A1 1 0 0 0 13.414 11H15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"></path>
              </svg>
              {images.length} photos
            </div>
          )}
        </div>

        <div className="hall-status-badges">
          <span
            className={`status-badge status-${
              hall.isApproved === "approved" || hall.isApproved === true
                ? "approved"
                : hall.isApproved === "rejected"
                ? "rejected"
                : "pending"
            }`}
          >
            {hall.isApproved === "approved" || hall.isApproved === true ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                Approved
              </>
            ) : hall.isApproved === "rejected" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                REJECTED
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,8 12,12 16,16"></polyline>
                </svg>
                Pending
              </>
            )}
          </span>
          <span
            className={`status-badge status-${hall.isAvailable ? "available" : "unavailable"
              }`}
          >
            {hall.isAvailable ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
                Available
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Unavailable
              </>
            )}
          </span>
        </div>
      </div>

      <div className="hall-card-body">
        <div className="hall-info">
          <h3 className="hall-name">{hall.name}</h3>
          <div className="hall-location">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>
              {hall.location.city}, {hall.location.state}
            </span>
          </div>
        </div>

        <div className="hall-details">
          <div className="detail-item">
            <span className="detail-label">Capacity:</span>
            <span className="detail-value">{hall.capacity} people</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Price:</span>
            <span className="detail-value">₹{hall.pricePerHour}/hr</span>
          </div>
        </div>
      </div>

      <div className="hall-card-actions">
        {hall.isApproved === "rejected" ? (
          // Rejected hall - show Update Hall button
          <button
            onClick={handleEditClick}
            className="btn-action btn-update-rejected"
            data-tooltip="Update and Resubmit Hall"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
            </svg>
            Update Hall
          </button>
        ) : (
          // Approved or Pending - show Edit and Delete buttons
          <>
            <button
              onClick={handleEditClick}
              className="btn-action btn-edit"
              data-tooltip="Edit Hall Details"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(hall._id)}
              className="btn-action btn-delete"
              data-tooltip="Delete Hall"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const MyHalls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {

      // Try the main endpoint first
      let response = await axios.get("/api/halls/my-halls");

      // If no halls returned, try the all-my-halls endpoint
      if (response.data.length === 0) {
        response = await axios.get("/api/halls/all-my-halls");
      }

      setHalls(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load halls");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hall?")) {
      return;
    }

    try {
      await axios.delete(`/api/halls/${id}`);
      toast.success("Hall deleted successfully");
      fetchHalls();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete hall");
    }
  };

  if (loading) {
    return (
      <div className="my-halls">
        <div className="dashboard-layout">
          <div className="dashboard-content">
            <div className="page-header">
              <h1>My Halls</h1>
              <Link to="/hall-owner/halls/add" className="btn-add-hall">
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
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                Add New Hall
              </Link>
            </div>
            <div className="halls-container grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <HallCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const approvedHalls = halls.filter((hall) => hall.isApproved).length;
  const pendingHalls = halls.filter((hall) => !hall.isApproved).length;
  const availableHalls = halls.filter((hall) => hall.isAvailable).length;

  return (
    <div className="my-halls">
      <div className="dashboard-layout">
        <div className="dashboard-content">
          <div className="page-header">
            <h1>My Halls</h1>
            <Link to="/hall-owner/halls/add" className="btn-add-hall">
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
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Add New Hall
            </Link>
          </div>

          {halls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
              </div>
              <h3>No Halls Yet</h3>
              <p>
                Start building your hall portfolio by adding your first venue
              </p>
              <Link to="/hall-owner/halls/add" className="btn-add-first">
                Add Your First Hall
              </Link>
            </div>
          ) : (
            <div className="halls-section">
              <div className="section-header">
                <div className="section-info">
                  <h2>
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
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                    Your Hall Listings
                  </h2>
                  <p>
                    Manage and monitor your venue portfolio
                  </p>
                </div>
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
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
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
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
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="halls-container grid">
                  {halls.map((hall) => (
                    <MyHallCard
                      key={hall._id}
                      hall={hall}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="table-container">
                  <table className="halls-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Hall Name</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Price/Hour</th>
                        <th>Status</th>
                        <th>Availability</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {halls.map((hall) => {
                        const images =
                          hall.images && hall.images.length > 0
                            ? hall.images.map((img) =>
                                img.startsWith("http")
                                  ? img
                                  : `http://localhost:5000/${img}`
                              )
                            : [
                                "https://images.unsplash.com/photo-5197411497674-611481863552?w=400&h=250&fit=crop&crop=center",
                              ];

                        return (
                          <>
                            <tr key={hall._id}>
                              <td>
                                <div className="table-image">
                                <img
                                  src={images[0]}
                                  alt={hall.name}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop&crop=center";
                                  }}
                                />
                                {images.length > 1 && (
                                  <span className="image-count">+{images.length - 1}</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="table-hall-name">{hall.name}</div>
                            </td>
                            <td>
                              <div className="table-location">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {hall.location.city}, {hall.location.state}
                              </div>
                            </td>
                            <td>
                              <div className="table-capacity">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                {hall.capacity}
                              </div>
                            </td>
                            <td>
                              <div className="table-price">₹{hall.pricePerHour}</div>
                            </td>
                            <td>
                              <span
                                className={`table-badge ${
                                  hall.isApproved === "approved" || hall.isApproved === true
                                    ? "badge-approved"
                                    : hall.isApproved === "rejected"
                                    ? "badge-rejected"
                                    : "badge-pending"
                                }`}
                              >
                                {hall.isApproved === "approved" || hall.isApproved === true ? (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20,6 9,17 4,12"></polyline>
                                    </svg>
                                    Approved
                                  </>
                                ) : hall.isApproved === "rejected" ? (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line x1="15" y1="9" x2="9" y2="15"></line>
                                      <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    REJECTED
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <polyline points="12,8 12,12 16,16"></polyline>
                                    </svg>
                                    Pending
                                  </>
                                )}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`table-badge ${
                                  hall.isAvailable ? "badge-available" : "badge-unavailable"
                                }`}
                              >
                                {hall.isAvailable ? (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22,4 12,14.01 9,11.01"></polyline>
                                    </svg>
                                    Available
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line x1="15" y1="9" x2="9" y2="15"></line>
                                      <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    Unavailable
                                  </>
                                )}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                {hall.isApproved === "rejected" ? (
                                  // Rejected hall - show Update Hall button
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.location.href = `/hall-owner/halls/edit/${hall._id}`;
                                    }}
                                    className="table-btn table-btn-update-rejected"
                                    title="Update and Resubmit Hall"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                                    </svg>
                                    Update
                                  </button>
                                ) : (
                                  // Approved or Pending - show Edit and Delete buttons
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.location.href = `/hall-owner/halls/edit/${hall._id}`;
                                      }}
                                      className="table-btn table-btn-edit"
                                      title="Edit Hall"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
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
                                    <button
                                      onClick={() => handleDelete(hall._id)}
                                      className="table-btn table-btn-delete"
                                      title="Delete Hall"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="3,6 5,6 21,6"></polyline>
                                        <path d="M19,6V20a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyHalls;
