import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/commons/Loader";
import "./Reviews.css";

const Reviews = () => {
  const topRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [editing, setEditing] = useState(false);
  const [showEditAnimation, setShowEditAnimation] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load reviews first to ensure filtering works correctly
        await fetchUserReviews();
        // Then load completed bookings
        await fetchCompletedBookings();
      } catch (error) {
              }
    };
    loadData();
  }, []);

  const fetchUserReviews = async () => {
    try {
      const response = await axios.get("/api/reviews/user/my-reviews");
      setReviews(response.data);
    } catch (error) {
            console.error(error);
            toast.error("Failed to load reviews");
    }
  };

  const fetchCompletedBookings = async () => {
    try {
      const response = await axios.get("/api/bookings");
      const completed = response.data.filter(
        (booking) => booking.status === "completed",
      );
      setCompletedBookings(completed);
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any available bookings to review
    const availableBookings = completedBookings.filter((booking) =>
      canReviewBooking(booking._id),
    );
    if (availableBookings.length === 0) {
      toast.error("No completed bookings available to review");
      return;
    }

    if (!selectedBooking) {
      toast.error("Please select a booking to review");
      return;
    }

    // Validate required fields
    if (!selectedBooking.hall?._id || !selectedBooking._id) {
            toast.error(
        "Invalid booking data. Please try selecting the booking again.",
      );
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

    setSubmitting(true);
    try {
      const response = await axios.post("/api/reviews", {
        hall: selectedBooking.hall._id,
        booking: selectedBooking._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      setSelectedBooking(null);
      fetchUserReviews();
      fetchCompletedBookings(); // Refresh the bookings list to remove the reviewed booking
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || "Bad request";
        if (errorMessage.includes("already exists")) {
          toast.error("You have already reviewed this booking");
        } else if (errorMessage.includes("completed")) {
          toast.error("This booking is not completed yet");
        } else {
          toast.error(errorMessage);
        }
      } else if (error.response?.status === 403) {
        toast.error("You are not authorized to review this booking");
      } else if (error.response?.status === 404) {
        toast.error("Booking not found");
      } else {
        toast.error(error.response?.data?.message || "Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? "filled" : ""} ${interactive ? "interactive" : ""
              }`}
            onClick={interactive ? () => onChange && onChange(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const canReviewBooking = (bookingId) => {
    // Check if user hasn't already reviewed this booking
    const hasReviewed = reviews.some(
      (review) => review.booking && review.booking._id === bookingId,
    );
    return !hasReviewed;
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setEditForm({ rating: review.rating, comment: review.comment });
    setShowEditModal(true);
    // Trigger animation after a small delay to ensure DOM is ready
    setTimeout(() => setShowEditAnimation(true), 10);
  };

  const closeEditModal = () => {
    if (editing) return;
    setShowEditAnimation(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setShowEditModal(false);
      setEditingReview(null);
      setEditForm({ rating: 5, comment: "" });
    }, 300);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReview?._id) return;
    if (!editForm.comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    if (editForm.rating < 1 || editForm.rating > 5) {
      toast.error("Please provide a valid rating (1-5 stars)");
      return;
    }
    setEditing(true);
    try {
      await axios.put(`/api/reviews/${editingReview._id}`, {
        rating: editForm.rating,
        comment: editForm.comment.trim(),
      });
      toast.success("Review updated successfully!");
      closeEditModal();
      fetchUserReviews();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update review");
    } finally {
      setEditing(false);
    }
  };

  const openDeleteConfirm = (review) => {
    setDeletingReview(review);
    setShowDeleteConfirm(true);
    // Trigger animation after a small delay to ensure DOM is ready
    setTimeout(() => setShowDeleteAnimation(true), 10);
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setShowDeleteAnimation(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setShowDeleteConfirm(false);
      setDeletingReview(null);
    }, 300);
  };

  const handleDeleteReview = async () => {
    if (!deletingReview?._id) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/reviews/${deletingReview._id}`);
      toast.success("Review deleted successfully!");
      closeDeleteConfirm();
      fetchUserReviews();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="reviews-page">
      <div className="reviews-header" ref={topRef}>
        <div className="header-content">
          <h1>My Reviews</h1>
        </div>
      </div>

      {showReviewForm && (
        <div className="review-form-container">
          <div className="review-form-card">
            <h2>Write a Review</h2>
            {completedBookings.filter((booking) =>
              canReviewBooking(booking._id),
            ).length === 0 ? (
              <div className="no-bookings-message">
                <p>
                  You don't have any completed bookings available to review at
                  this time.
                </p>
                <p>
                  Complete a booking and wait for it to be marked as completed
                  to leave a review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Select Booking to Review</label>
                  <select
                    key={`booking-select-${completedBookings.length}-${reviews.length}`}
                    name="booking"
                    value={selectedBooking ? selectedBooking._id : ""}
                    onChange={(e) => {
                      const booking = completedBookings.find(
                        (b) => b._id === e.target.value,
                      );
                      setSelectedBooking(booking || null);
                    }}
                    required={
                      completedBookings.filter((booking) =>
                        canReviewBooking(booking._id),
                      ).length > 0
                    }
                  >
                    <option value="" disabled>
                      Choose a completed booking...
                    </option>
                    {(() => {
                      const availableBookings = completedBookings.filter(
                        (booking) => canReviewBooking(booking._id),
                      );

                      return availableBookings.map((booking) => (
                        <option key={booking._id} value={booking._id}>
                          {booking.hall?.name} -{" "}
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </option>
                      ));
                    })()}
                    {completedBookings.filter((booking) =>
                      canReviewBooking(booking._id),
                    ).length === 0 && (
                        <option value="" disabled>
                          No completed bookings available to review
                        </option>
                      )}
                  </select>
                </div>

                {selectedBooking && (
                  <div className="booking-summary">
                    <h3>Booking Details</h3>
                    <p>
                      <strong>Hall:</strong> {selectedBooking.hall?.name}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        selectedBooking.bookingDate,
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedBooking.startTime} -{" "}
                      {selectedBooking.endTime}
                    </p>
                  </div>
                )}

                <div className="form-group">
                  <label>Rating</label>
                  {renderStars(reviewForm.rating, true, (rating) =>
                    setReviewForm({ ...reviewForm, rating }),
                  )}
                </div>

                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    placeholder="Share your experience..."
                    rows="4"
                    required
                    maxLength="500"
                  />
                  <small className="char-count">
                    {reviewForm.comment.length}/500 characters
                  </small>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      submitting ||
                      completedBookings.filter((booking) =>
                        canReviewBooking(booking._id),
                      ).length === 0
                    }
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewForm({ rating: 5, comment: "" });
                      setSelectedBooking(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="reviews-section">
        <h2>Your Reviews ({reviews.length})</h2>

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <div className="no-reviews-icon">📝</div>
            <h3>No reviews yet</h3>
            <p>
              You haven't written any reviews yet. Complete a booking to leave a
              review!
            </p>
          </div>
        ) : (
          <div className="reviews-cards-container">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-card-hall-info">
                    <h3>{review.hall?.name}</h3>
                    {review.isVerified && (
                      <span className="verified-badge">✓ Verified Review</span>
                    )}
                  </div>
                  <div className="review-card-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                <div className="review-card-body">
                  <p className="review-card-comment">{review.comment}</p>
                </div>
                
                <div className="review-card-footer">
                  <span className="review-card-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <div className="review-card-actions">
                    <button
                      className="btn-edit-review"
                      onClick={() => openEditModal(review)}
                      aria-label="Edit review"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete-review"
                      onClick={() => openDeleteConfirm(review)}
                      aria-label="Delete review"
                    >
                       Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showEditModal && (
        <div
          className={`review-edit-modal-overlay ${showEditAnimation ? 'show' : ''}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="review-edit-modal">
            <div className="review-edit-modal-header">
              <h3>Edit Review</h3>
              <button
                type="button"
                className="review-edit-modal-close"
                onClick={closeEditModal}
                disabled={editing}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="review-edit-modal-body">
                <p className="review-edit-modal-hall">
                  <strong>{editingReview?.hall?.name}</strong>
                </p>
                <div className="review-edit-modal-field">
                  <label>Rating</label>
                  {renderStars(editForm.rating, true, (rating) =>
                    setEditForm((prev) => ({ ...prev, rating }))
                  )}
                </div>
                <div className="review-edit-modal-field">
                  <label>Comment</label>
                  <textarea
                    className="review-edit-modal-textarea"
                    rows={4}
                    value={editForm.comment}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Share your experience..."
                    maxLength={500}
                    disabled={editing}
                  />
                  <div className="review-edit-modal-charcount">
                    {editForm.comment.length}/500
                  </div>
                </div>
              </div>

              <div className="review-edit-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                  disabled={editing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editing}
                >
                  {editing ? "Updating..." : "Update Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div
          className={`review-delete-confirm-overlay ${showDeleteAnimation ? 'show' : ''}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteConfirm();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="review-delete-confirm">
            <div className="review-delete-confirm-header">
              <h3>Delete Review</h3>
              <button
                type="button"
                className="review-delete-confirm-close"
                onClick={closeDeleteConfirm}
                disabled={deleting}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="review-delete-confirm-body">
              <p>
                Are you sure you want to delete your review for{" "}
                <strong>{deletingReview?.hall?.name}</strong>?
              </p>
              <p>This action cannot be undone.</p>
            </div>

            <div className="review-delete-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteReview}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Reviews;
