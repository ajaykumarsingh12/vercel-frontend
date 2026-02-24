import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loader from "../components/commons/Loader";
import HallCard from "../components/commons/HallCard";
import HallCardSkeleton from "../components/commons/HallCardSkeleton";
import AvailabilityCalendar from "../components/commons/AvailabilityCalendar";
import CustomDatePicker from "../components/commons/CustomDatePicker";
import {
  calculateTotalHours,
  calculatePricingBreakdown,
  calculateDetailedDuration,
  formatDetailedDuration,
} from "../utils/calculations";
import "./HallDetail.css";

const HallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, toggleFavorite, favorites } = useAuth();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    specialRequests: "",
  });
  const [booking, setBooking] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilityMsg, setAvailabilityMsg] = useState("");
  const [detailedDuration, setDetailedDuration] = useState(null);
  const [similarHalls, setSimilarHalls] = useState([]);
  const [similarHallsLoading, setSimilarHallsLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
  });
  const [shareMenuOpen, setShareMenuOpen] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBookingAnimation, setShowBookingAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allUpcomingBookings, setAllUpcomingBookings] = useState([]);
  const [availabilityView, setAvailabilityView] = useState("carousel"); // carousel or calendar
  const [availabilitySlots, setAvailabilitySlots] = useState([]); // Slots from hallalloteds collection
  const [showAvailabilityResults, setShowAvailabilityResults] = useState(false); // Control visibility of results

  // Helper function to get correct image URL (handles both Cloudinary and local paths)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-image.png";
    
    // If it's already a full URL (Cloudinary), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, it's a local path - construct the URL
    const cleanPath = imagePath.replace("uploads/", "");
    return `http://localhost:5000/uploads/${cleanPath}`;
  };

  // Update current time every minute to refresh availability slots
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Format time to 12-hour AM/PM format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchHall();
    fetchReviews();
    fetchUpcomingBookings();
    fetchAvailabilitySlots(); // Fetch availability slots from hallalloteds collection
    // Scroll to top when hall ID changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Refresh availability data periodically to catch real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAvailabilitySlots();
      fetchUpcomingBookings();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [id]);

  // Reset availability results when date changes
  useEffect(() => {
    setShowAvailabilityResults(false);
  }, [bookingData.bookingDate]);

  useEffect(() => {
    if (hall) {
      fetchSimilarHalls();
    }
  }, [hall]);

  useEffect(() => {
    if (bookingData.bookingDate) {
      fetchBookedSlots(bookingData.bookingDate);
    }
  }, [bookingData.bookingDate]);

  // Real-time pricing and duration calculation
  useEffect(() => {
    if (bookingData.startTime && bookingData.endTime && hall?.pricePerHour) {
      const isAvailable = checkAvailability(
        bookingData.startTime,
        bookingData.endTime,
        bookedSlots
      );

      if (isAvailable) {
        const hours = calculateTotalHours(
          bookingData.startTime,
          bookingData.endTime
        );

        const duration = calculateDetailedDuration(
          bookingData.startTime,
          bookingData.endTime
        );
        setDetailedDuration(duration);

        if (hours > 0) {
          const pricingBreakdown = calculatePricingBreakdown(
            hours,
            hall.pricePerHour
          );
          setPricing(pricingBreakdown);
        } else {
          setPricing(null);
        }
      } else {
        setPricing(null);
        setDetailedDuration(null);
      }
    } else {
      setPricing(null);
      setDetailedDuration(null);
    }
  }, [bookingData.startTime, bookingData.endTime, bookedSlots, hall?.pricePerHour]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/${id}`);
      setReviewsData(response.data);
    } catch (error) {
    }
  };

  const fetchSimilarHalls = async () => {
    try {
      if (!hall) return;

      setSimilarHallsLoading(true);

      // Fetch all halls
      const response = await axios.get("/api/halls");
      const allHalls = response.data;

      // Filter similar halls based on price and capacity
      const priceRange = hall.pricePerHour * 0.3; // 30% price range
      const capacityRange = hall.capacity * 0.2; // 20% capacity range

      const similar = allHalls
        .filter(h => h._id !== hall._id) // Exclude current hall
        .filter(h => {
          const priceDiff = Math.abs(h.pricePerHour - hall.pricePerHour);
          const capacityDiff = Math.abs(h.capacity - hall.capacity);
          return priceDiff <= priceRange && capacityDiff <= capacityRange;
        })
        .slice(0, 6); // Limit to 6 similar halls

      setSimilarHalls(similar);
    } catch (error) {
    } finally {
      setSimilarHallsLoading(false);
    }
  };

  const fetchBookedSlots = async (date) => {
    try {
      const response = await axios.get(
        `/api/bookings/availability/${id}?date=${date}`,
      );
      setBookedSlots(response.data);
    } catch (error) {
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const response = await axios.get(`/api/bookings/availability/${id}`);
      setAllUpcomingBookings(response.data);
    } catch (error) {
    }
  };

  const fetchAvailabilitySlots = async () => {
    try {
      // Fetch ALL hall allotments from hallalloteds collection
      const response = await axios.get(`/api/hallalloted/hall/${id}/all`);
      // console.log('Fetched availability slots:', response.data);
      // console.log('Total slots:', response.data.length);
      // console.log('Available slots:', response.data.filter(s => s.status === 'available' && s.isAvailabilitySlot).length);
      // console.log('Booked slots:', response.data.filter(s => s.status !== 'available' || !s.isAvailabilitySlot).length);
      setAvailabilitySlots(response.data);
    } catch (error) {
            console.error('Error fetching availability slots:', error);
            setAvailabilitySlots([]);
    }
  };

  const checkAvailability = (startTime, endTime, slots) => {
    if (!startTime || !endTime || !slots.length) {
      setAvailabilityMsg("");
      return true;
    }

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    for (const slot of slots) {
      const slotStart = new Date(`2000-01-01 ${slot.startTime}`);
      const slotEnd = new Date(`2000-01-01 ${slot.endTime}`);

      if (start < slotEnd && end > slotStart) {
        setAvailabilityMsg(
          `⚠️ SLOT BOOKED: This time slot is already booked from ${slot.startTime} to ${slot.endTime}. The hall will be available after ${slot.endTime}.`,
        );
        return false;
      }
    }

    setAvailabilityMsg("");
    return true;
  };

  const fetchHall = async () => {
    try {
      const response = await axios.get(`/api/halls/${id}`);
      setHall(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load hall details");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info("Please login to book a hall");
      navigate("/login", { state: { from: `/halls/${id}` } });
      return;
    }

    if (user && (user.role === "admin" || user.role === "hall_owner")) {
      toast.info("Please login as a User to book a hall");
      navigate("/login", { state: { from: `/halls/${id}` } });
      return;
    }

    try {
      setBooking(true);
      
      const response = await axios.post("/api/bookings", {
        hall: id,
        ...bookingData,
      });

      toast.success("Booking created successfully!");

      // Refresh availability data to show updated booking status
      await fetchAvailabilitySlots();
      await fetchUpcomingBookings();

      // Close the booking modal
      setShowBookingModal(false);
      setShowBookingAnimation(false);

      // Reset booking form
      setBookingData({
        bookingDate: "",
        startTime: "",
        endTime: "",
        specialRequests: "",
      });

      // Navigate to bookings page after a short delay to show the updated availability
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  const selectSlot = (slot) => {
    setBookingData({
      ...bookingData,
      bookingDate: new Date(slot.date || slot.allotmentDate).toISOString().split("T")[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setShowBookingModal(true);
    setTimeout(() => setShowBookingAnimation(true), 10);
  };

  if (loading) return <Loader />;
  if (!hall) return <p>Hall not found</p>;

  return (
    <div className="hall-detail">
      <div className="hall-detail-content">
        <div className="hall-images">
          {hall.images && hall.images.length > 0 ? (
            <div className="image-upload-section">
              <h3>Hall Photos</h3>

              {/* Main Hall Photo (Cover Image) */}
              {hall.images[0] && (
                <div className="image-display-group">
                  <label>Main Hall Photo (Cover Image)</label>
                  <div className="image-display-container">
                    <img
                      src={getImageUrl(hall.images[0])}
                      alt={`${hall.name} - Main Hall Photo`}
                      className="display-image"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png"; // fallback
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Stage Photo */}
              {hall.images[1] && (
                <div className="image-display-group">
                  <label>Stage Photo</label>
                  <div className="image-display-container">
                    <img
                      src={getImageUrl(hall.images[1])}
                      alt={`${hall.name} - Stage Photo`}
                      className="display-image"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png"; // fallback
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Seating Arrangement */}
              {hall.images[2] && (
                <div className="image-display-group">
                  <label>Seating Arrangement</label>
                  <div className="image-display-container">
                    <img
                      src={getImageUrl(hall.images[2])}
                      alt={`${hall.name} - Seating Arrangement`}
                      className="display-image"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png"; // fallback
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Dining Area */}
              {hall.images[3] && (
                <div className="image-display-group">
                  <label>Dining Area</label>
                  <div className="image-display-container">
                    <img
                      src={getImageUrl(hall.images[3])}
                      alt={`${hall.name} - Dining Area`}
                      className="display-image"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png"; // fallback
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Parking Area */}
              {hall.images[4] && (
                <div className="image-display-group">
                  <label>Parking Area</label>
                  <div className="image-display-container">
                    <img
                      src={getImageUrl(hall.images[4])}
                      alt={`${hall.name} - Parking Area`}
                      className="display-image"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png"; // fallback
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Outside View */}
              {hall.images[5] && (
                <div className="image-display-group">
                  <label>Outside View</label>
                  <div className="image-display-container">
                    <img
                      src={getImageUrl(hall.images[5])}
                      alt={`${hall.name} - Outside View`}
                      className="display-image"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png"; // fallback
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Washroom Photos */}
              {hall.images.length > 6 && (
                <div className="image-display-group">
                  <label>Washroom Photos</label>
                  <div className="image-gallery">
                    {hall.images.slice(6).map((image, index) => (
                      <div key={index} className="gallery-item">
                        <img
                          src={getImageUrl(image)}
                          alt={`${hall.name} - Washroom ${index + 1}`}
                          className="gallery-image"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png"; // fallback
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-image">
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>No images available</p>
            </div>
          )}
        </div>

        <div className="hall-info-card">
          {/* Header Section */}
          <div className="hall-info-header">
            <div className="title-favorite-wrapper">
              <h1 className="hall-title">{hall.name}</h1>
              <button
                className={`favorite-btn-detail ${favorites?.includes(hall._id) ? "active" : ""}`}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info("Please login to add favorites");
                    return;
                  }
                  if (user.role !== "user") {
                    toast.info("Only users can add favorites");
                    return;
                  }
                  toggleFavorite(hall._id);
                }}
                title={
                  favorites?.includes(hall._id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={
                    favorites?.includes(hall._id)
                      ? "currentColor"
                      : "none"
                  }
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>
                  {favorites?.includes(hall._id)
                    ? "Favorited"
                    : "Add to Favorites"}
                </span>
              </button>
            </div>
          </div>

          {/* Location Section */}
          <div className="info-section location-section">
            <div className="section-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="section-content">
              <h3 className="section-title">Location</h3>
              <p className="section-text">
                {hall.location.address}, {hall.location.city},{" "}
                {hall.location.state} - {hall.location.pincode}
              </p>
              
              {/* Google Maps Embed */}
              {hall.location?.coordinates?.lat && hall.location?.coordinates?.lng ? (
                <div className="google-map-container">
                  <iframe
                    title="Hall Location"
                    src={`https://maps.google.com/maps?q=${hall.location.coordinates.lat},${hall.location.coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '12px', marginTop: '1rem' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  {hall.location.googleMapsUrl && (
                    <a
                      href={hall.location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-on-maps-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      View on Google Maps
                    </a>
                  )}
                </div>
              ) : (
                <div className="no-map-message">
                  <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    📍 Map location not available. Hall owner can add Google Maps location when editing this hall.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Key Details Section */}
          <div className="key-details-grid">
            <div className="detail-card price-card">
              <div className="detail-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 0 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Price per Hour</span>
                <span className="detail-value">₹{hall.pricePerHour}</span>
              </div>
            </div>

            <div className="detail-card capacity-card">
              <div className="detail-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 2l-4 4" />
                  <path d="M18 2l4 4" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Capacity</span>
                <span className="detail-value">{hall.capacity} guests</span>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          {hall.amenities && hall.amenities.length > 0 && (
            <div className="info-section amenities-section">
              <div className="section-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1" />
                  <path d="M3 21h18" />
                  <path d="M5 21V12" />
                  <path d="M19 21V12" />
                </svg>
              </div>
              <div className="section-content">
                <h3 className="section-title">Amenities & Facilities</h3>
                <div className="amenities-grid">
                  {hall.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="info-section contact-section">
            <div className="section-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className="section-content">
              <h3 className="section-title">Contact Owner</h3>
              <p className="section-text">
                <strong>{hall.owner?.name}</strong>:{" "}
                {hall.owner?.phone || "N/A"}
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="info-section description-section">
            <div className="section-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
            </div>
            <div className="section-content">
              <h3 className="section-title">Description</h3>
              <p className="section-text description-text">

                {hall.description}
              </p>
            </div>
          </div>
        </div>

        {/* Hall Availability Carousel Section */}
        {availabilitySlots && (
          (() => {
            // console.log('Processing availability slots:', availabilitySlots.length);
            
            const processedAvailability = availabilitySlots.map(slot => {
              const slotDate = new Date(slot.allotmentDate);

              // Set both to midnight to compare only dates
              const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
              const justSlotDate = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());

              // console.log('Slot date:', justSlotDate, 'Today:', today, 'Slot:', slot);

              // If slot date is before today, mark as past
              if (justSlotDate < today) {
                // console.log('Slot marked as past (date before today)');
                return { ...slot, isPast: true };
              }

              // If slot date is today, check if end time has passed
              if (justSlotDate.getTime() === today.getTime()) {
                const [hours, minutes] = slot.endTime.split(':');
                const slotEndDate = new Date(justSlotDate.getFullYear(), justSlotDate.getMonth(), justSlotDate.getDate(), parseInt(hours), parseInt(minutes));

                // Only mark as past if end time has passed
                if (slotEndDate <= currentTime) {
                  // console.log('Slot marked as past (end time passed)');
                  return { ...slot, isPast: true };
                }
              }

              // Determine if slot is booked based on status and isAvailabilitySlot flag
              const isBooked = slot.status !== 'available' || !slot.isAvailabilitySlot;
              const bookingStatus = slot.status;

              return {
                ...slot,
                isBooked,
                bookingStatus,
                isPast: false,
                // Convert allotmentDate to date for compatibility with existing code
                date: slot.allotmentDate
              };
            }).filter(slot => {
              // Only filter out past slots
              // Show both available and booked slots (including completed ones)
              const keep = !slot.isPast;
              if (!keep) {
                // console.log('Filtering out past slot:', slot);
              }
              return keep;
            });

            // console.log('Processed availability count:', processedAvailability.length);
            // console.log('Available slots:', processedAvailability.filter(s => !s.isBooked).length);
            // console.log('Booked slots:', processedAvailability.filter(s => s.isBooked).length);

            return (
              <div className={`availability-carousel-detail ${processedAvailability.length === 0 ? 'empty' : ''}`}>
                {/* IRCTC-Style Date Selection Form */}
                <div className="booking-form-irctc">
                  <div className="form-header-irctc">
                    <h2>CHECK AVAILABILITY</h2>
                    <p>Select a date to view all available time slots</p>
                  </div>
                  <div className="form-content-irctc">
                    <div className="form-group-irctc">
                      <label htmlFor="booking-date">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Select Date
                      </label>
                      <CustomDatePicker
                        value={bookingData.bookingDate}
                        onChange={(date) => setBookingData({ ...bookingData, bookingDate: date })}
                        minDate={(() => {
                          const today = new Date();
                          return today.toISOString().split('T')[0];
                        })()}
                      />
                    </div>
                    <button 
                      className="search-btn-irctc"
                      onClick={() => {
                        if (!bookingData.bookingDate) {
                          toast.error("Please select a date");
                          return;
                        }
                        // Show availability results
                        setShowAvailabilityResults(true);
                        // Scroll to availability section
                        setTimeout(() => {
                          document.querySelector('.availability-results-section')?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }, 100);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      Check Availability
                    </button>
                  </div>
                </div>

                {/* Availability Results Section - Shows only when date is selected AND button is clicked */}
                {bookingData.bookingDate && showAvailabilityResults && (
                  <div className="availability-results-section">
                    <div className="availability-header-full">
                      <div className="header-left">
                        <div className="section-icon-main">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="section-title-main">
                            Availability for {new Date(bookingData.bookingDate).toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </h3>
                          <p className="section-subtitle-main">
                            Select an available time slot below to reserve this hall instantly.
                            {processedAvailability.filter(s => {
                              const slotDate = new Date(s.allotmentDate).toISOString().split('T')[0];
                              return slotDate === bookingData.bookingDate;
                            }).length > 0 && (
                              <span className="availability-stats">
                                {' '}({processedAvailability.filter(s => {
                                  const slotDate = new Date(s.allotmentDate).toISOString().split('T')[0];
                                  return slotDate === bookingData.bookingDate && !s.isBooked;
                                }).length} available, {processedAvailability.filter(s => {
                                  const slotDate = new Date(s.allotmentDate).toISOString().split('T')[0];
                                  return slotDate === bookingData.bookingDate && s.isBooked;
                                }).length} booked)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      // Filter slots for selected date
                      const slotsForDate = processedAvailability.filter(s => {
                        const slotDate = new Date(s.allotmentDate).toISOString().split('T')[0];
                        return slotDate === bookingData.bookingDate;
                      });

                      return slotsForDate.length > 0 ? (
                        <div className="slots-grid-scrollable">
                          {slotsForDate.map((slot, index) => (
                            <div
                              key={index}
                              className={`slot-card-irctc ${slot.isBooked ? 'booked' : 'available'}`}
                              onClick={() => !slot.isBooked && selectSlot(slot)}
                              style={{ cursor: slot.isBooked ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="slot-card-header">
                                <div className="slot-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={!slot.isBooked}
                                    disabled={slot.isBooked}
                                    readOnly
                                  />
                                </div>
                                <div className="slot-time-display">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </div>
                                <div className={`slot-status-badge ${slot.isBooked ? 'booked' : 'available'}`}>
                                  {slot.isBooked ? (
                                    slot.bookingStatus === 'confirmed' ? '● BOOKED' :
                                    slot.bookingStatus === 'completed' ? '● COMPLETED' :
                                    slot.bookingStatus === 'cancelled' ? '● CANCELLED' : '● UNAVAILABLE'
                                  ) : (
                                    '● AVAILABLE'
                                  )}
                                </div>
                              </div>
                              
                              {slot.isBooked && slot.user && (
                                <div className="slot-booking-details">
                                </div>
                              )}

                              {!slot.isBooked && (
                                <button className="instant-book-btn">
                                  INSTANT BOOKING →
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-slots-message">
                          <div className="no-slots-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </div>
                          <h4>No Slots Available for This Date</h4>
                          <p>Please try another date or contact the owner for custom bookings.</p>
                          <div className="contact-owner-info">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            Contact Owner: {hall.owner?.phone || "N/A"}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Show message when no date is selected */}
                {!bookingData.bookingDate && (
                  <div className="select-date-prompt">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <h3>Select a Date to View Availability</h3>
                    <p>Choose a date above to see all available and booked time slots for that day</p>
                  </div>
                )}
              </div>
            );

          })()
        )}
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Reviews & Ratings</h2>
        <div className="reviews-summary">
          <div className="rating-overview">
            <div className="average-rating">
              <span className="rating-number">{reviewsData.averageRating}</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= Math.round(reviewsData.averageRating)
                      ? "filled"
                      : ""
                      }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="total-reviews">
                {reviewsData.totalReviews} reviews
              </span>
            </div>
          </div>
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewsData.reviews.filter(
                (r) => r.rating === rating,
              ).length;
              const percentage =
                reviewsData.totalReviews > 0
                  ? (count / reviewsData.totalReviews) * 100
                  : 0;
              return (
                <div key={rating} className="rating-bar">
                  <span className="rating-label">{rating} ★</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="reviews-list">
          {reviewsData.reviews.length === 0 ? (
            <p className="no-reviews-text">No reviews yet for this hall.</p>
          ) : (
            reviewsData.reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.user?.name}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= review.rating ? "filled" : ""
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="review-text">{review.comment}</p>
                {review.isVerified && (
                  // <span className="verified-badge">✓ Verified Booking</span>
                  <b>✓ Verified Booking</b>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Place Your Hall Button */}
      <div className="place-hall-section">
    
      </div>

      {/* Similar Halls Section */}
      {(similarHallsLoading || similarHalls.length > 0) && (
        <div className="similar-halls-section">
          <div className="section-header-similar">
            <h2>Similar Halls</h2>
            <p>Based on price and capacity</p>
          </div>
          {similarHallsLoading ? (
            <div className="similar-halls-grid">
              {[1, 2, 3].map((i) => (
                <HallCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="similar-halls-grid-scrollable">
              {similarHalls.map((similarHall) => (
              <div key={similarHall._id} className="similar-hall-wrapper">
                <div className="similar-hall-card">
                  <div className="similar-hall-image">
                    <img
                      src={
                        similarHall.images && similarHall.images.length > 0
                          ? similarHall.images[0].startsWith("http")
                            ? similarHall.images[0]
                            : `http://localhost:5000/${similarHall.images[0]}`
                          : "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop&crop=center"
                      }
                      alt={similarHall.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop&crop=center";
                      }}
                    />
                    <div className="similar-hall-badges">
                      <div className="capacity-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>{similarHall.capacity}</span>
                      </div>
                      <div className="price-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>₹{similarHall.pricePerHour}/hr</span>
                      </div>
                    </div>

                    {/* Like and Share Icons */}
                    <div className="similar-hall-actions">
                      <button
                        className={`similar-hall-favorite ${favorites?.includes(similarHall._id) ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isAuthenticated) {
                            toast.info("Please login to add favorites");
                            return;
                          }
                          if (user.role !== "user") {
                            toast.info("Only users can add favorites");
                            return;
                          }
                          toggleFavorite(similarHall._id);
                        }}
                        title={favorites?.includes(similarHall._id) ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={favorites?.includes(similarHall._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                      <div className="similar-hall-share-container">
                        <button
                          className={`similar-hall-share ${shareMenuOpen === similarHall._id ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setShareMenuOpen(shareMenuOpen === similarHall._id ? null : similarHall._id);
                          }}
                          title="Share this hall"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                        </button>

                        {shareMenuOpen === similarHall._id && (
                          <div className="similar-hall-share-menu" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="share-menu-option facebook"
                              onClick={(e) => {
                                e.preventDefault();
                                const url = `${window.location.origin}/halls/${similarHall._id}`;
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                setShareMenuOpen(null);
                              }}
                              title="Share on Facebook"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                              <span>Facebook</span>
                            </button>
                            <button
                              className="share-menu-option whatsapp"
                              onClick={(e) => {
                                e.preventDefault();
                                const url = `${window.location.origin}/halls/${similarHall._id}`;
                                const text = `Check out ${similarHall.name} - ${similarHall.location?.city}, ${similarHall.location?.state}. Capacity: ${similarHall.capacity} people. Price: ₹${similarHall.pricePerHour}/hr`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                                setShareMenuOpen(null);
                              }}
                              title="Share on WhatsApp"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                              <span>WhatsApp</span>
                            </button>
                            <button
                              className="share-menu-option copy"
                              onClick={(e) => {
                                e.preventDefault();
                                const url = `${window.location.origin}/halls/${similarHall._id}`;
                                navigator.clipboard.writeText(url).then(() => {
                                  toast.success('Link copied to clipboard!');
                                  setShareMenuOpen(null);
                                });
                              }}
                              title="Copy Link"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                              <span>Copy Link</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="similar-hall-content">
                    <h3>{similarHall.name}</h3>
                    <div className="similar-hall-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{similarHall.location?.city}, {similarHall.location?.state}</span>
                    </div>
                    <Link to={`/halls/${similarHall._id}`} className="view-detail-btn">
                      VIEW DETAIL
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}
      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className={`booking-modal-overlay ${showBookingAnimation ? 'visible' : ''}`}
          onClick={() => {
            setShowBookingAnimation(false);
            setTimeout(() => setShowBookingModal(false), 300);
          }}
        >
          <div
            className={`booking-modal-content ${showBookingAnimation ? 'visible' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-modal-main">
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowBookingAnimation(false);
                  setTimeout(() => setShowBookingModal(false), 300);
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="booking-modal-header">
                <h2>Reserve Your Hall</h2>
                <p>Fast & secure booking in under a minute</p>
              </div>

              <form onSubmit={handleBooking} className="booking-modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>BOOKING DATE</label>
                    <div className="input-wrapper">
                      <input
                        type="date"
                        name="bookingDate"
                        value={bookingData.bookingDate}
                        onChange={handleBookingChange}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="form-control"
                        readOnly
                      />
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>START TIME</label>
                    <div className="input-wrapper">
                      <input
                        type="time"
                        name="startTime"
                        value={bookingData.startTime}
                        onChange={handleBookingChange}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        required
                        className="form-control"
                        readOnly
                      />
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>END TIME</label>
                    <div className="input-wrapper">
                      <input
                        type="time"
                        name="endTime"
                        value={bookingData.endTime}
                        onChange={handleBookingChange}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        required
                        className="form-control"
                        readOnly
                      />
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>DURATION</label>
                    <div className={`duration-display ${detailedDuration ? 'active' : ''}`}>
                      <span className="duration-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </span>
                      <span>
                        {detailedDuration
                          ? formatDetailedDuration(detailedDuration)
                          : "0 minutes"}
                      </span>
                    </div>
                  </div>
                </div>

                {availabilityMsg && (
                  <div className="availability-alert">
                    <p>{availabilityMsg}</p>
                  </div>
                )}

                {pricing && (
                  <div className="pricing-summary">
                    <div className="price-row">
                      <span>Price per hour</span>
                      <span>{pricing.formattedPricePerHour}</span>
                    </div>
                    <div className="price-row">
                      <span>Total Hours</span>
                      <span>{pricing.formattedHours}</span>
                    </div>
                    <div className="price-row total">
                      <span>Total Amount</span>
                      <span>{pricing.formattedAmount}</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>SPECIAL REQUESTS</label>
                  <div className="textarea-wrapper">
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleBookingChange}
                      placeholder="Any special requirements or requests..."
                      rows="3"
                      className="form-control"
                      readOnly
                    ></textarea>
                    <span className="textarea-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                        <path d="M2 2l7.586 7.586"></path>
                        <circle cx="11" cy="11" r="2"></circle>
                      </svg>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-book-now"
                  disabled={booking}
                >
                  {booking ? (
                    <>
                      <span className="spinner-small"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      BOOK NOW
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallDetail;
