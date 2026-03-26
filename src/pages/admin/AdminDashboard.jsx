import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/commons/Loader";
import Sidebar from "../../components/commons/Sidebar";
import "./AdminDashboard.css";

// Hall Details Dialog Component
const HallDetailsDialog = ({ hall, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!hall) return null;

  const images =
    hall.images && hall.images.length > 0
      ? hall.images.map((img) =>
        img.startsWith("http") ? img : `http://localhost:5000/${img}`
      )
      : ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"];

  return (
    <div className="hall-details-dialog-overlay" onClick={onClose}>
      <div className="hall-details-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Hall Details Report</h2>
          <button className="dialog-close-btn" onClick={onClose}>
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="dialog-content">
          {/* Images Section */}
          <div className="dialog-section">
            <h3 className="section-title">Hall Images</h3>
            <div className="dialog-image-gallery">
              <div className="main-image-container">
                <img
                  src={images[currentImageIndex]}
                  alt={hall.name}
                  className="main-image"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800";
                  }}
                />
                {images.length > 1 && (
                  <div className="image-counter">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="thumbnail-grid">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${hall.name} ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800";
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="dialog-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Hall Name:</span>
                <span className="info-value">{hall.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Owner Name:</span>
                <span className="info-value">{hall.owner?.name || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Owner Email:</span>
                <span className="info-value">{hall.owner?.email || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Owner Phone:</span>
                <span className="info-value">{hall.owner?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="dialog-section">
            <h3 className="section-title">Pricing & Capacity</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Price Per Hour:</span>
                <span className="info-value highlight-price">₹{hall.pricePerHour}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Capacity:</span>
                <span className="info-value highlight-capacity">{hall.capacity} people</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="dialog-section">
            <h3 className="section-title">Location</h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <span className="info-label">Address:</span>
                <span className="info-value">{hall.location?.address || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">City:</span>
                <span className="info-value">{hall.location?.city || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">State:</span>
                <span className="info-value">{hall.location?.state || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Pincode:</span>
                <span className="info-value">{hall.location?.pincode || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="dialog-section">
            <h3 className="section-title">Description</h3>
            <p className="description-text">{hall.description || "No description provided"}</p>
          </div>

          {/* Amenities */}
          <div className="dialog-section">
            <h3 className="section-title">Amenities</h3>
            <div className="amenities-grid">
              {hall.amenities && hall.amenities.length > 0 ? (
                hall.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-tag">
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
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {amenity}
                  </div>
                ))
              ) : (
                <p className="no-data">No amenities listed</p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="dialog-section">
            <h3 className="section-title">Availability</h3>
            <div className="availability-info">
              {hall.availability && hall.availability.length > 0 ? (
                <div className="availability-grid">
                  {hall.availability.map((slot, index) => (
                    <div key={index} className="availability-slot">
                      <span className="slot-day">{slot.day}</span>
                      <span className="slot-time">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No availability information</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsDialog = ({ hall, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 320);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/api/admin/halls/${hall._id}/reviews`);
        setReviews(res.data);
      } catch (e) {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [hall._id]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`/api/admin/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast.success("Review deleted");
    } catch (e) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div
      className={`hall-details-dialog-overlay${closing ? " overlay-closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`hall-details-dialog reviews-dialog${closing ? " dialog-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2>Reviews — {hall.name}</h2>
          <button className="dialog-close-btn" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="dialog-content">
          {loading ? (
            <p style={{ padding: "1rem", textAlign: "center" }}>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No reviews for this hall yet.
            </div>
          ) : (
            <div className="admin-reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="admin-review-card">
                  <div className="admin-review-header">
                    <div className="admin-review-user">
                      <span className="admin-review-name">{review.user?.name || "Unknown"}</span>
                      <span className="admin-review-email">{review.user?.email}</span>
                    </div>
                    <div className="admin-review-meta">
                      <span className="admin-review-stars">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                      <span className="admin-review-date">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <button
                        className="admin-review-delete-btn"
                        onClick={() => handleDelete(review._id)}
                        title="Delete review"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="admin-review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsTableRow = ({ label, value, icon, color, badge }) => {
  return (
    <div className="sml-row">
      <div className="sml-left">
        <div className="sml-icon" style={{ background: `${color}18`, color }}>{icon}</div>
        <span className="sml-label">{label}</span>
      </div>
      <div className="sml-right">
        {badge && (
          <span className="sml-badge" style={{ background: `${color}18`, color }}>{badge}</span>
        )}
        <span className="sml-value" style={{ color }}>{value}</span>
      </div>
    </div>
  );
};

const AdminHallCard = ({ hall, handleApproveHall, onViewDetails, onViewReviews }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images =
    hall.images && hall.images.length > 0
      ? hall.images.map((img) =>
        img.startsWith("http")
          ? img
          : `http://localhost:5000/${img}`
      )
      : [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      ];

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
        <div className="hall-image-container admin-carousel">
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
                  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800";
              }}
            />
          </AnimatePresence>

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

          <div className="hall-status-overlay">
            <span className={`status-badge status-${hall.isApproved || 'pending'}`}>
              {images.length > 1 ? `Photo ${currentImageIndex + 1}/${images.length}` : (hall.isApproved === "approved" ? "Approved" : hall.isApproved === "rejected" ? "Rejected" : "Pending")}
            </span>
          </div>

          {/* View Details Button - Top Right Corner */}
          <button
            className="view-details-icon-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewDetails(hall);
            }}
            title="View Full Details"
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
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>

          {/* Reviews Button - Top Left Corner */}
          <button
            className="view-details-icon-btn reviews-icon-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewReviews(hall);
            }}
            title="View Reviews"
          >
            ⭐
          </button>
        </div>
      </div>

      <div className="hall-card-body">
        <div className="hall-info">
          <h3 className="hall-name">{hall.name}</h3>
          <div className="hall-location">
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
            <span><b style={{ 'color': 'orange' }}>Capacity:</b> {hall.capacity}people</span>
          </div>
          <div className="detail-item">
            <span><b style={{ 'color': 'orange' }}>Price:₹</b>{hall.pricePerHour}/hr</span>
          </div>
        </div>

        <div className="hall-owner-info">
          <div className="owner-details">
            <span className="owner-label">Owner </span>
            <span className="owner-name">{hall.owner?.name}</span>
          </div>
        </div>
      </div>

      <div className="hall-card-actions">
        {hall.isApproved !== "approved" && (
          <button
            onClick={() => handleApproveHall(hall._id, true)}
            className="btn btn-approve"
          >
            Approve
          </button>
        )}
        {hall.isApproved !== "rejected" && (
          <button
            onClick={() => handleApproveHall(hall._id, false)}
            className="btn btn-reject"
          >
            Reject
          </button>
        )}
        {hall.isApproved === "approved" && (
          <button
            onClick={() => handleApproveHall(hall._id, false)}
            className="btn btn-reject"
          >
            Revoke
          </button>
        )}
        {hall.isApproved === "rejected" && (
          <button
            onClick={() => handleApproveHall(hall._id, true)}
            className="btn btn-approve"
          >
            Re-approve
          </button>
        )}
      </div>
    </div>
  );
};

const AdminHallTableRow = ({ hall, handleApproveHall, onViewReviews }) => {
  const images =
    hall.images && hall.images.length > 0
      ? hall.images.map((img) =>
        img.startsWith("http")
          ? img
          : `http://localhost:5000/${img}`
      )
      : ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"];

  return (
    <tr className="hall-table-row">
      <td className="hall-info-cell">
        <div className="hall-thumbnail">
          <img
            src={images[0]}
            alt={hall.name}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800";
            }}
          />
        </div>
        <div className="hall-details-text">
          <h4 className="hall-name">{hall.name}</h4>
          <p className="hall-location">
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
          </p>
        </div>
      </td>
      <td className="capacity-cell">{hall.capacity} people</td>
      <td className="price-cell">₹{hall.pricePerHour}/hr</td>
      <td className="owner-cell">
        <div className="owner-info">
          {/* <svg
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg> */}
          {hall.owner?.name}
        </div>
      </td>
      <td className="status-cell">
        <span className={`status-badge status-${hall.isApproved || 'pending'}`}>
          {hall.isApproved === "approved" ? "Approved" : hall.isApproved === "rejected" ? "Rejected" : "Pending"}
        </span>
      </td>
      <td className="actions-cell">
        <div className="table-actions">
          <button
            onClick={() => onViewReviews(hall)}
            className="btn btn-reviews btn-sm"
            title="View Reviews"
          >
            ⭐
          </button>
          {hall.isApproved !== "approved" && (
            <button
              onClick={() => handleApproveHall(hall._id, true)}
              className="btn btn-approve btn-sm"
              title={hall.isApproved === "rejected" ? "Re-approve Hall" : "Approve Hall"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </button>
          )}
          {hall.isApproved !== "rejected" && (
            <button
              onClick={() => handleApproveHall(hall._id, false)}
              className="btn btn-reject btn-sm"
              title={hall.isApproved === "approved" ? "Revoke Hall" : "Reject Hall"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const AdminUserTableRow = ({ user, handleDeleteUser, handleBlockUser }) => {
  const profileImageUrl = user.profileImage
    ? (user.profileImage.startsWith('http')
      ? user.profileImage
      : `http://localhost:5000/${user.profileImage}`)
    : null;

  return (
    <tr className="user-table-row">
      <td className="user-info-cell">
        <div className="user-avatar-small">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={user.name}
              className="user-avatar-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
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
            style={{ display: profileImageUrl ? 'none' : 'block' }}
          >
            {user.role === "admin" ? (
              <path d="M12 1l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"></path>
            ) : (
              <>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </>
            )}
          </svg>
        </div>
        <div className="user-details-text">
          <h4 className="user-name">{user.name}</h4>
          <p className="user-email">{user.email}</p>
        </div>
      </td>
      <td className="role-cell">
        <span className={`user-role-badge ${user.role}`}>
          {user.role === "admin" ? (
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
                <path d="M12 1l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"></path>
              </svg>
              Administrator
            </>
          ) : user.role === "hall_owner" ? (
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
                <path d="M3 21h18v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2z"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Hall Owner
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              User
            </>
          )}
        </span>
      </td>
      <td className="registered-cell">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="actions-cell">
        <div className="table-actions">
          <button
            onClick={() => handleBlockUser(user._id, !user.isBlocked, user.name)}
            className={`btn btn-sm ${user.isBlocked ? 'btn-success' : 'btn-warning'}`}
            title={user.isBlocked ? 'Unblock User' : 'Block User'}
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
              {user.isBlocked ? (
                <>
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </>
              )}
            </svg>
          </button>
          <button
            onClick={() => handleDeleteUser(user._id)}
            className="btn btn-danger btn-sm"
            title="Delete User"
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
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [halls, setHalls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list" for stats
  const [hallsViewMode, setHallsViewMode] = useState("grid"); // "grid" or "list" for halls
  const [usersViewMode, setUsersViewMode] = useState("grid"); // "grid" or "list" for users
  const [unblockRequests, setUnblockRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [csvState, setCsvState] = useState("idle"); // idle | downloading | done
  const [selectedHall, setSelectedHall] = useState(null);
  const [showHallDialog, setShowHallDialog] = useState(false);
  const [showReviewsDialog, setShowReviewsDialog] = useState(false);
  const [reviewsHall, setReviewsHall] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [hallSearch, setHallSearch] = useState("");
  const [hallStatusFilter, setHallStatusFilter] = useState("pending");

  useEffect(() => {
    fetchStats();
    fetchPendingHalls();
    fetchUsers();
    fetchUnblockRequests();
    fetchBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPendingHalls = async () => {
    try {
      const response = await axios.get("/api/admin/halls");
      setHalls(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/admin/bookings");
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUnblockRequests = async () => {
    try {
      const response = await axios.get("/api/admin/unblock-requests");
      // Deduplicate by relatedId in case DB has old duplicate records
      const seen = new Set();
      const unique = response.data.filter(r => {
        const key = r.relatedId?._id || r.relatedId || r._id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setUnblockRequests(unique);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveHall = async (id, approve) => {
    try {
      await axios.put(`/api/admin/halls/${id}/approve`, {
        isApproved: approve,
      });
      toast.success(approve ? "Hall approved" : "Hall rejected");
      fetchPendingHalls();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update hall status");
    }
  };

  const handleViewDetails = (hall) => {
    setSelectedHall(hall);
    setShowHallDialog(true);
  };

  const handleCloseDialog = () => {
    setShowHallDialog(false);
    setSelectedHall(null);
  };

  const handleViewReviews = (hall) => {
    setReviewsHall(hall);
    setShowReviewsDialog(true);
  };

  const handleCloseReviews = () => {
    setShowReviewsDialog(false);
    setReviewsHall(null);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${id}`);
      toast.success("User deleted successfully");
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  const handleBlockUser = async (id, isBlocked, userName) => {
    const action = isBlocked ? "block" : "unblock";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await axios.put(`/api/admin/users/${id}/block`, { isBlocked });
      toast.success(`${userName} ${action}ed successfully`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} ${userName}`);
    }
  };

  const handleApproveUnblockRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to approve this unblock request?")) {
      return;
    }

    try {
      await axios.put(`/api/admin/unblock-requests/${requestId}/approve`);
      toast.success("User unblocked successfully");
      fetchUnblockRequests();
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve unblock request");
    }
  };

  const handleDenyUnblockRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to deny this unblock request?")) {
      return;
    }

    try {
      await axios.put(`/api/admin/unblock-requests/${requestId}/deny`);
      toast.success("Unblock request denied");
      fetchUnblockRequests();
    } catch (error) {
      console.error(error);
      toast.error("Failed to deny unblock request");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <h1>Admin Dashboard</h1>

          <div className="tabs">
            <button
              className={activeTab === "stats" ? "active" : ""}
              onClick={() => setActiveTab("stats")}
            >
              Statistics
            </button>
            <button
              className={activeTab === "halls" ? "active" : ""}
              onClick={() => setActiveTab("halls")}
            >
              All Halls ({halls.length})
            </button>
            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
            <button
              className={activeTab === "unblockRequests" ? "active" : ""}
              onClick={() => setActiveTab("unblockRequests")}
            >
              Unblock Requests ({unblockRequests.length})
            </button>
            <button
              className={activeTab === "bookings" ? "active" : ""}
              onClick={() => setActiveTab("bookings")}
            >
              All Bookings ({bookings.length})
            </button>
          </div>

          {activeTab === "stats" && stats && (
            <div className="stats-section">
              <div className="section-header">
                <div className="section-info">
                  <h2>Statistics Overview</h2>
                  <p>
                    Monitor key metrics and performance indicators
                  </p>
                </div>
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === "grid" ? "active" : ""
                      }`}
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
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
                  </button>
                  <button
                    className={`view-btn ${viewMode === "list" ? "active" : ""
                      }`}
                    onClick={() => setViewMode("list")}
                    title="List View"
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
              <div className={`stats-container ${viewMode}`}>
                {viewMode === "grid" ? (
                  <>
                    <div className="stat-card">
                      <h3>Total Users</h3>
                      <p className="stat-number">{stats.totalUsers}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Hall Owners</h3>
                      <p className="stat-number">{stats.totalHallOwners}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Halls</h3>
                      <p className="stat-number">{stats.totalHalls}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Pending Halls</h3>
                      <p className="stat-number">{stats.pendingHalls}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Bookings</h3>
                      <p className="stat-number">{stats.totalBookings}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Pending Bookings</h3>
                      <p className="stat-number">{stats.pendingBookings}</p>
                    </div>
                  </>
                ) : (
                  <div className="stats-metric-list">
                    <StatsTableRow label="Total Users" value={stats.totalUsers} color="#3b82f6" badge="Registered"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    />
                    <StatsTableRow label="Hall Owners" value={stats.totalHallOwners} color="#8b5cf6" badge="Owners"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2z"/><circle cx="12" cy="7" r="4"/></svg>}
                    />
                    <StatsTableRow label="Total Halls" value={stats.totalHalls} color="#10b981" badge="Listed"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>}
                    />
                    <StatsTableRow label="Pending Halls" value={stats.pendingHalls} color="#f59e0b" badge="Awaiting Review"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
                    />
                    <StatsTableRow label="Total Bookings" value={stats.totalBookings} color="#06b6d4" badge="All Time"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                    />
                    <StatsTableRow label="Pending Bookings" value={stats.pendingBookings} color="#ef4444" badge="Action Needed"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "halls" && (
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                    All Halls
                  </h2>
                  <p>
                    View, search and manage all hall listings
                  </p>
                </div>

                <div className="view-toggle">
                  <button
                    className={`view-btn ${hallsViewMode === "grid" ? "active" : ""
                      }`}
                    onClick={() => setHallsViewMode("grid")}
                    title="Grid View"
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
                  </button>
                  <button
                    className={`view-btn ${hallsViewMode === "list" ? "active" : ""
                      }`}
                    onClick={() => setHallsViewMode("list")}
                    title="List View"
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

              {/* Halls Search & Filter Bar */}
              <div className="users-search-bar">
                <div className="users-search-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    placeholder="Search by hall name, city or owner..."
                    value={hallSearch}
                    onChange={e => setHallSearch(e.target.value)}
                    className="users-search-input"
                  />
                  {hallSearch && (
                    <button className="users-search-clear" onClick={() => setHallSearch("")}>✕</button>
                  )}
                </div>
                <div className="users-role-filter">
                  {["all", "pending", "approved", "rejected"].map(s => (
                    <button
                      key={s}
                      className={`role-filter-btn ${hallStatusFilter === s ? "active" : ""}`}
                      onClick={() => setHallStatusFilter(s)}
                    >
                      {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Halls results count */}
              {(() => {
                const filtered = halls.filter(h => {
                  if (hallStatusFilter !== "all" && h.isApproved !== hallStatusFilter) return false;
                  if (hallSearch) {
                    const q = hallSearch.toLowerCase();
                    return h.name?.toLowerCase().includes(q) ||
                      h.location?.city?.toLowerCase().includes(q) ||
                      h.owner?.name?.toLowerCase().includes(q);
                  }
                  return true;
                });
                return (
                  <p className="users-results-count">
                    Showing <strong>{filtered.length}</strong> of <strong>{halls.length}</strong> halls
                    {(hallSearch || hallStatusFilter !== "all") && (
                      <button className="users-clear-filters" onClick={() => { setHallSearch(""); setHallStatusFilter("all"); }}>
                        Clear filters
                      </button>
                    )}
                  </p>
                );
              })()}

              {(() => {
                const filteredHalls = halls.filter(h => {
                  if (hallStatusFilter !== "all" && h.isApproved !== hallStatusFilter) return false;
                  if (hallSearch) {
                    const q = hallSearch.toLowerCase();
                    return h.name?.toLowerCase().includes(q) ||
                      h.location?.city?.toLowerCase().includes(q) ||
                      h.owner?.name?.toLowerCase().includes(q);
                  }
                  return true;
                });

                if (filteredHalls.length === 0) return (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                    </div>
                    <h3>No Halls Found</h3>
                    <p>{hallSearch || hallStatusFilter !== "all" ? "Try adjusting your search or filters" : "No halls have been added yet"}</p>
                  </div>
                );

                return hallsViewMode === "grid" ? (
                  <div className="halls-container grid">
                    {filteredHalls.map((hall) => (
                      <AdminHallCard
                        key={hall._id}
                        hall={hall}
                        handleApproveHall={handleApproveHall}
                        onViewDetails={handleViewDetails}
                        onViewReviews={handleViewReviews}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="halls-table-container">
                    <div className="table-wrapper">
                      <table className="halls-table">
                        <thead>
                          <tr>
                            <th className="hall-info-header"><div className="header-content">Hall Information</div></th>
                            <th className="capacity-header"><div className="header-content">Capacity</div></th>
                            <th className="price-header"><div className="header-content">Price</div></th>
                            <th className="owner-header"><div className="header-content">Owner</div></th>
                            <th className="status-header"><div className="header-content">Status</div></th>
                            <th className="actions-header"><div className="header-content">Actions</div></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredHalls.map((hall) => (
                            <AdminHallTableRow
                              key={hall._id}
                              hall={hall}
                              handleApproveHall={handleApproveHall}
                              onViewReviews={handleViewReviews}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-section">
              <div className="section-header">
                <div className="section-info">
                  <h2>
                    <span className="section-title">User Management</span>
                  </h2>
                  <p className="section-description">
                    Manage and monitor system users
                  </p>
                </div>
                <div className="view-toggle">
                  <button
                    className={`view-btn ${usersViewMode === "grid" ? "active" : ""
                      }`}
                    onClick={() => setUsersViewMode("grid")}
                    title="Grid View"
                    aria-label="Switch to grid view"
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
                      className="view-icon"
                    >
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  <button
                    className={`view-btn ${usersViewMode === "list" ? "active" : ""
                      }`}
                    onClick={() => setUsersViewMode("list")}
                    title="List View"
                    aria-label="Switch to list view"
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
                      className="view-icon"
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

              {/* Search & Filter Bar */}
              <div className="users-search-bar">
                <div className="users-search-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="users-search-input"
                  />
                  {userSearch && (
                    <button className="users-search-clear" onClick={() => setUserSearch("")}>✕</button>
                  )}
                </div>
                <div className="users-role-filter">
                  {["all", "user", "hall_owner"].map(role => (
                    <button
                      key={role}
                      className={`role-filter-btn ${userRoleFilter === role ? "active" : ""}`}
                      onClick={() => setUserRoleFilter(role)}
                    >
                      {role === "all" ? "All" : role === "hall_owner" ? "Hall Owners" : "Users"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              {(() => {
                const filtered = users.filter(u => {
                  if (u.role === "admin") return false;
                  if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
                  if (userSearch) {
                    const q = userSearch.toLowerCase();
                    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q);
                  }
                  return true;
                });
                const total = users.filter(u => u.role !== "admin").length;
                return (
                  <p className="users-results-count">
                    Showing <strong>{filtered.length}</strong> of <strong>{total}</strong> users
                    {(userSearch || userRoleFilter !== "all") && (
                      <button className="users-clear-filters" onClick={() => { setUserSearch(""); setUserRoleFilter("all"); }}>
                        Clear filters
                      </button>
                    )}
                  </p>
                );
              })()}

              <div className={`users-container ${usersViewMode}`}>
                {users.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <h3>No Users Found</h3>
                    <p>No users have been registered in the system yet.</p>
                  </div>
                ) : usersViewMode === "grid" ? (
                  users.filter(user => {
                    if (user.role === "admin") return false;
                    if (userRoleFilter !== "all" && user.role !== userRoleFilter) return false;
                    if (userSearch) {
                      const q = userSearch.toLowerCase();
                      return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q) || user.phone?.toLowerCase().includes(q);
                    }
                    return true;
                  }).map((user) => {
                    const profileImageUrl = user.profileImage
                      ? (user.profileImage.startsWith('http')
                        ? user.profileImage
                        : `http://localhost:5000/${user.profileImage}`)
                      : null;

                    return (
                      <div key={user._id} className="user-card">
                        <div
                          className={`user-avatar ${user.role === "admin" ? "admin" : ""}`}
                        >
                          {profileImageUrl ? (
                            <img
                              src={profileImageUrl}
                              alt={user.name}
                              className="user-avatar-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="avatar-icon"
                            style={{ display: profileImageUrl ? 'none' : 'block' }}
                          >
                            {user.role === "admin" ? (
                              <path d="M12 1l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"></path>
                            ) : (
                              <>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </>
                            )}
                          </svg>
                        </div>
                        <div className="user-info">
                          <h4 className="user-name">{user.name}</h4>
                          <p className="user-email">{user.email}</p>
                          <span
                            className={`user-role ${user.role === "admin" ? "admin" : user.role === "hall_owner" ? "hall-owner" : "user"}`}
                          >
                            {user.role === "admin" ? (
                              <>
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
                                  className="role-icon"
                                >
                                  <path d="M12 1l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"></path>
                                </svg>
                                Administrator
                              </>
                            ) : user.role === "hall_owner" ? (
                              <>
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
                                  className="role-icon"
                                >
                                  <path d="M3 21h18v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2z"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Hall Owner
                              </>
                            ) : (
                              <>
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
                                  className="role-icon"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                User
                              </>
                            )}
                          </span>
                        </div>
                        <div className="user-actions">
                          <button
                            onClick={() => handleBlockUser(user._id, !user.isBlocked, user.name)}
                            className={`btn btn-sm ${user.isBlocked ? 'btn-success' : 'btn-warning'}`}
                            aria-label={user.isBlocked ? `Unblock user ${user.name}` : `Block user ${user.name}`}
                            title={user.isBlocked ? 'Unblock User' : 'Block User'}
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
                              {user.isBlocked ? (
                                <>
                                  <path d="M18 6L6 18"></path>
                                  <path d="M6 6l12 12"></path>
                                </>
                              ) : (
                                <>
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                </>
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn btn-danger btn-sm"
                            aria-label={`Delete user ${user.name}`}
                            title="Delete User"
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
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="users-table-container">
                    <div className="table-wrapper">
                      <table className="users-table">
                        <thead>
                          <tr>
                            <th className="user-info-header">
                              <div className="header-content">
                                User Information
                              </div>
                            </th>
                            <th className="role-header">
                              <div className="header-content">
                                Role
                              </div>
                            </th>
                            <th className="date-header">
                              <div className="header-content">
                                Registered Date
                              </div>
                            </th>
                            <th className="actions-header">
                              <div className="header-content">
                                Actions
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(user => {
                            if (user.role === "admin") return false;
                            if (userRoleFilter !== "all" && user.role !== userRoleFilter) return false;
                            if (userSearch) {
                              const q = userSearch.toLowerCase();
                              return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q) || user.phone?.toLowerCase().includes(q);
                            }
                            return true;
                          }).map((user) => (
                            <AdminUserTableRow
                              key={user._id}
                              user={user}
                              handleDeleteUser={handleDeleteUser}
                              handleBlockUser={handleBlockUser}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bookings-admin-section">
              <div className="section-header">
                <div className="section-info">
                  <h2>All Bookings</h2>
                  <p>View and monitor all bookings across the platform</p>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="bookings-toolbar">
                <button
                  className={`bookings-download-btn ${csvState !== "idle" ? "csv-" + csvState : ""}`}
                  title="Download as CSV"
                  disabled={csvState !== "idle"}
                  onClick={() => {
                    setCsvState("downloading");
                    const filtered = bookings.filter(b => {
                      if (bookingStatusFilter !== "all" && b.status !== bookingStatusFilter) return false;
                      if (bookingSearch) {
                        const q = bookingSearch.toLowerCase();
                        return b.hall?.name?.toLowerCase().includes(q) ||
                          b.user?.name?.toLowerCase().includes(q) ||
                          b.user?.email?.toLowerCase().includes(q);
                      }
                      return true;
                    });
                    const headers = ["Hall", "City", "User", "Email", "Phone", "Date", "Start Time", "End Time", "Amount", "Status", "Payment"];
                    const rows = filtered.map(b => [
                      b.hall?.name || "",
                      b.hall?.location?.city || "",
                      b.user?.name || "",
                      b.user?.email || "",
                      b.user?.phone || "",
                      new Date(b.bookingDate).toLocaleDateString("en-IN"),
                      b.startTime || "",
                      b.endTime || "",
                      Math.round(b.totalAmount || 0),
                      b.status || "",
                      b.paymentStatus || ""
                    ]);
                    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setTimeout(() => {
                      setCsvState("done");
                      setTimeout(() => setCsvState("idle"), 2000);
                    }, 2000);
                  }}
                >
                  {/* Animated ring overlay */}
                  {csvState === "downloading" && <span className="csv-ring" />}

                  {/* Icon states */}
                  {csvState === "idle" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  )}
                  {csvState === "downloading" && (
                    <span className="csv-label-text">CSV</span>
                  )}
                  {csvState === "done" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="csv-check">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
                <div className="users-search-bar" style={{ flex: 1 }}>
                  <div className="users-search-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                      type="text"
                      placeholder="Search by hall, user or email..."
                      value={bookingSearch}
                      onChange={e => setBookingSearch(e.target.value)}
                      className="users-search-input"
                    />
                    {bookingSearch && <button className="users-search-clear" onClick={() => setBookingSearch("")}>✕</button>}
                  </div>
                  <div className="users-role-filter">
                    {["all", "pending", "confirmed", "cancelled"].map(s => (
                      <button
                        key={s}
                        className={`role-filter-btn ${bookingStatusFilter === s ? "active" : ""}`}
                        onClick={() => setBookingStatusFilter(s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bookings-revenue-box">
                  <span className="revenue-label">Total Revenue</span>
                  <span className="revenue-amount">
                    ₹{bookings
                      .filter(b => {
                        if (bookingStatusFilter !== "all" && b.status !== bookingStatusFilter) return false;
                        if (bookingSearch) {
                          const q = bookingSearch.toLowerCase();
                          return b.hall?.name?.toLowerCase().includes(q) ||
                            b.user?.name?.toLowerCase().includes(q) ||
                            b.user?.email?.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .filter(b => b.paymentStatus === "paid")
                      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {(() => {
                const filtered = bookings.filter(b => {
                  if (bookingStatusFilter !== "all" && b.status !== bookingStatusFilter) return false;
                  if (bookingSearch) {
                    const q = bookingSearch.toLowerCase();
                    return b.hall?.name?.toLowerCase().includes(q) ||
                      b.user?.name?.toLowerCase().includes(q) ||
                      b.user?.email?.toLowerCase().includes(q);
                  }
                  return true;
                });

                // Group by date
                const grouped = filtered.reduce((acc, b) => {
                  const dateKey = new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
                  if (!acc[dateKey]) acc[dateKey] = [];
                  acc[dateKey].push(b);
                  return acc;
                }, {});

                return (
                  <>
                    <p className="users-results-count">
                      Showing <strong>{filtered.length}</strong> of <strong>{bookings.length}</strong> bookings
                      {(bookingSearch || bookingStatusFilter !== "all") && (
                        <button className="users-clear-filters" onClick={() => { setBookingSearch(""); setBookingStatusFilter("all"); }}>Clear filters</button>
                      )}
                    </p>

                    {filtered.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <h3>No Bookings Found</h3>
                        <p>{bookingSearch || bookingStatusFilter !== "all" ? "Try adjusting your filters" : "No bookings yet"}</p>
                      </div>
                    ) : (
                      <div className="booking-timeline">
                        {Object.entries(grouped).map(([date, dayBookings]) => (
                          <div key={date} className="timeline-day">
                            <div className="timeline-date-label">
                              <span className="timeline-date-dot">💐</span>
                              <span className="timeline-date-text">{date}</span>
                              <span className="timeline-date-count">{dayBookings.length} booking{dayBookings.length > 1 ? "s" : ""}</span>
                            </div>
                            <div className="timeline-cards">
                              {dayBookings.map(b => (
                                <div key={b._id} className={`timeline-card tl-${b.status}`}>
                                  <div className="tl-left-bar" />
                                  <div className="tl-body">
                                    <div className="tl-top">
                                      <div className="tl-hall">
                                        <span className="tl-hall-name">{b.hall?.name || "—"}</span>
                                        <span className="tl-hall-loc">📍 {b.hall?.location?.city}{b.hall?.location?.state ? `, ${b.hall.location.state}` : ""}</span>
                                      </div>
                                      <div className="tl-badges">
                                        <span className={`tl-badge tl-status-${b.status}`}>{b.status}</span>
                                        <span className={`tl-badge tl-pay-${b.paymentStatus || "pending"}`}>{b.paymentStatus || "pending"}</span>
                                      </div>
                                    </div>
                                    <div className="tl-bottom">
                                      <div className="tl-user">
                                        <span className="tl-icon">👤</span>
                                        <span>{b.user?.name || "—"}</span>
                                        <span className="tl-email">{b.user?.email}</span>
                                      </div>
                                      <div className="tl-meta">
                                        {b.startTime && b.endTime && (
                                          <span className="tl-chip">🕐 {b.startTime} – {b.endTime}</span>
                                        )}
                                        <span className="tl-chip tl-amount">₹{Math.round(b.totalAmount || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === "unblockRequests" && (
            <div className="unblock-requests-section">
              <div className="section-header">
                <div className="section-info">
                  <h2>
                    <span className="section-title">Unblock Requests</span>
                  </h2>
                  <p className="section-description">
                    Review and manage user unblock requests
                  </p>
                </div>
              </div>

              {unblockRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                  </div>
                  <h3>No Pending Requests</h3>
                  <p>All unblock requests have been reviewed</p>
                </div>
              ) : (
                <div className="unblock-requests-container">
                  {unblockRequests.map((request, index) => (
                    <div key={request._id} className="unblock-request-card" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="request-header">
                        <div className="user-info-section">
                          <div className="user-avatar-small">
                            {request.relatedId?.profileImage ? (
                              <img
                                src={request.relatedId.profileImage.startsWith('http')
                                  ? request.relatedId.profileImage
                                  : `http://localhost:5000/${request.relatedId.profileImage}`}
                                alt={request.requestData?.userName || request.relatedId?.name || "User"}
                                className="user-avatar-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {(request.requestData?.userRole === "hall_owner" || request.relatedId?.role === "hall_owner") ? (
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
                                style={{ display: request.relatedId?.profileImage ? 'none' : 'flex' }}
                              >
                                <path d="M3 21h18v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2z"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            ) : (
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
                                style={{ display: request.relatedId?.profileImage ? 'none' : 'flex' }}
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            )}
                          </div>
                          <div className="user-details">
                            <h4>{request.requestData?.userName || request.relatedId?.name || "Unknown User"}</h4>
                            <p className="user-email">{request.requestData?.userEmail || request.relatedId?.email || "N/A"}</p>
                            <span className={`user-role-badge ${request.requestData?.userRole || request.relatedId?.role || "user"}`}>
                              {request.requestData?.userRole === "hall_owner" || request.relatedId?.role === "hall_owner" ? "Hall Owner" : "User"}
                            </span>
                          </div>
                        </div>
                        <div className="request-date">
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
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                          </svg>
                          <span>{new Date(request.requestData?.requestedAt || request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="request-message">
                        <p>{request.message}</p>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleApproveUnblockRequest(request._id)}
                          className="btn btn-approve"
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
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          Approve & Unblock
                        </button>
                        <button
                          onClick={() => handleDenyUnblockRequest(request._id)}
                          className="btn btn-reject"
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
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Deny Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hall Details Dialog */}
      {showHallDialog && selectedHall && (
        <HallDetailsDialog hall={selectedHall} onClose={handleCloseDialog} />
      )}

      {/* Reviews Dialog */}
      {showReviewsDialog && reviewsHall && (
        <ReviewsDialog hall={reviewsHall} onClose={handleCloseReviews} />
      )}
    </div >
  );
};

export default AdminDashboard;
