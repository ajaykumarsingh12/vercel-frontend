import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../components/commons/Loader";
import "./MyBookings.css";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchReviewedBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings");
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewedBookings = async () => {
    try {
      const response = await axios.get("/api/reviews/user/my-reviews");
      const ids = new Set(
        (response.data || [])
          .map((review) => review?.booking?._id || review?.booking)
          .filter(Boolean),
      );
      setReviewedBookingIds(ids);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayment = (bookingId) => {
    navigate(`/payment?booking=${bookingId}`);
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewForm({ rating: 5, comment: "" });
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    if (submittingReview) return;
    setShowReviewModal(false);
    setReviewBooking(null);
    setReviewForm({ rating: 5, comment: "" });
  };

  const submitReview = async () => {
    if (!reviewBooking?._id || !reviewBooking?.hall?._id) {
      toast.error("Invalid booking. Please try again.");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Please provide a valid rating (1-5 stars)");
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post("/api/reviews", {
        hall: reviewBooking.hall._id,
        booking: reviewBooking._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      toast.success("Review submitted successfully!");
      setReviewedBookingIds((prev) => {
        const next = new Set(prev);
        next.add(reviewBooking._id);
        return next;
      });
      closeReviewModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`review-star ${star <= rating ? "filled" : ""}`}
            onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
            aria-label={`${star} star`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#fbbf24";
      case "confirmed":
        return "#10b981";
      case "completed":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDuration = (totalHours) => {
    const hours = Math.floor(Math.abs(totalHours));
    const minutes = Math.round((Math.abs(totalHours) - hours) * 60);

    if (hours === 0 && minutes === 0) return "0 minutes";
    if (hours === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await axios.delete(`/api/bookings/${id}`);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this cancelled booking?")) {
      return;
    }

    try {
      // Add deleting class for animation
      const cardElement = document.querySelector(`[data-booking-id="${id}"]`);
      if (cardElement) {
        cardElement.classList.add('deleting');
      }
      // Wait for animation to complete
      setTimeout(() => {
        // Remove from UI
        setBookings(prevBookings => prevBookings.filter(booking => booking._id !== id));
      }, 500);
      // Delete from backend
      await axios.delete(`/api/bookings/${id}`);
      toast.success("Booking deleted successfully");
    } catch (error) {
      console.error(error);
      const cardElement = document.querySelector(`[data-booking-id="${id}"]`);
      if (cardElement) {
        cardElement.classList.remove('deleting');
      }
      toast.error(error.response?.data?.message || "Failed to delete booking");
      fetchBookings();
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="my-bookings">
      <div className="bookings-header">
        <div>
          <h1>My Bookings</h1>
          <p className="bookings-subtitle">Manage your hall reservations and track booking status</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {["all", "pending", "confirmed", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? "All Bookings"
                : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && (
                <span className="count">
                  ({bookings.filter((b) => b.status === status).length})
                </span>
              )}
            </button>
          )
        )}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">
            {filter === "all" ? "📅" : "🔍"}
          </div>
          <h3>
            {filter === "all" ? "No bookings found" : `No ${filter} bookings`}
          </h3>
          <p>
            {filter === "all"
              ? "You haven't made any bookings yet. Start exploring halls to book your perfect venue!"
              : `You don't have any ${filter} bookings at the moment.`}
          </p>
          {filter === "all" && (
            <Link to="/halls" className="btn btn-primary">
              Browse Halls
            </Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card" data-booking-id={booking._id}>
              {/* Delete Icon - Top Right Corner */}
              {booking.status === "cancelled" && (
                <button
                  onClick={() => handleDelete(booking._id)}
                  className="delete-icon-btn"
                  title="Delete this booking"
                  aria-label="Delete booking"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
              <div className="booking-left-section">
                <div className="hall-header">
                  <h3>{booking.hall?.name}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {booking.status === "completed"
                      ? "Owner Confirmed"
                      : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                    }
                  </span>
                </div>
                <div className="hall-details">
                  <p className="location">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="3">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {booking.hall?.location?.city}, {booking.hall?.location?.state}
                  </p>
                  <p className="contact">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="3">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>{booking.hall?.owner?.phone || "N/A"} ({booking.hall?.owner?.name})
                  </p>
                </div>
              </div>

              <div className="booking-center-section">
                <div className="detail-card">
                  <span className="detail-label">DATE</span>
                  <span className="detail-value">
                    {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">TIME</span>
                  <span className="detail-value">
                    {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                  </span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">DURATION</span>
                  <span className="detail-value">{formatDuration(booking.totalHours)}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">AMOUNT</span>
                  <span className="detail-value amount">₹ {Math.abs(booking.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === "pending" && booking.paymentStatus === "pending" && (
                  <>
                    <button
                      onClick={() => handlePayment(booking._id)}
                      className="btn btn-pay-now"
                    >
                      🔒 Pay Now 
                    </button>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="btn btn-cancel"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {(booking.status === "confirmed" || booking.status === "completed") && (
                  <div className="booking-confirmed-wrap">
                    <button
                      type="button"
                      className="booking-confirmed-btn"
                      disabled
                    >
                      <span className="booking-confirmed-icon">✓</span>
                      Booking Confirmed
                    </button>
                    {booking.status === "completed" && (
                      <div className="booking-owner-confirmed">
                        Hall Owner Confirmed
                      </div>
                    )}

                    {booking.status === "completed" &&
                      !reviewedBookingIds.has(booking._id) && (
                        <button
                          onClick={() => openReviewModal(booking)}
                          className="btn btn-review-icon"
                          type="button"
                          title="Write Review"
                          aria-label="Write Review"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                        </button>
                      )}
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="status-message cancelled">
                    ❌ Booking Cancelled
                    {booking.paymentStatus === "refunded" && (
                      <span className="refund-note">💰 Refund Processed</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showReviewModal && (
        <div
          className="review-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeReviewModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="review-modal">
            <div className="review-modal-header">
              <h3>Write a Review</h3>
              <button
                type="button"
                className="review-modal-close"
                onClick={closeReviewModal}
                disabled={submittingReview}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="review-modal-body">
              <p className="review-modal-hall">
                <strong>{reviewBooking?.hall?.name}</strong>
              </p>
              <div className="review-modal-field">
                <label>Rating</label>
                {renderStars(reviewForm.rating)}
              </div>
              <div className="review-modal-field">
                <label>Comment</label>
                <textarea
                  className="review-modal-textarea"
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Share your experience..."
                  maxLength={500}
                  disabled={submittingReview}
                />
                <div className="review-modal-charcount">
                  {reviewForm.comment.length}/500
                </div>
              </div>
            </div>

            <div className="review-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeReviewModal}
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitReview}
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
