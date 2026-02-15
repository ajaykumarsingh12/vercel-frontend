import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Calendar from "../../components/commons/Calendar";
import HallTableSkeleton from "../../components/commons/HallTableSkeleton";
import DashboardStatsSkeleton from "../../components/commons/DashboardStatsSkeleton";
import HallSelectionSkeleton from "../../components/commons/HallSelectionSkeleton";

import "./HallOwnerDashboard.css";

const HallOwnerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, slots
  const [slots, setSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotForm, setSlotForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    isRecurring: false,
    recurringDays: [],
    endDate: ""
  });
  const [editingSlot, setEditingSlot] = useState(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotView, setSlotView] = useState("list"); // list, calendar
  const [highlightedHall, setHighlightedHall] = useState(null);
  const [hallView, setHallView] = useState("table"); // table, grid
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [completedBookings, setCompletedBookings] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 6;

  const checkExistingRevenueRecords = async () => {
    try {
      const response = await axios.get('/api/owner-revenue/latest');
      const existingRevenues = response.data.revenues || [];

      // Get booking IDs that already have revenue records (filter out null bookings)
      const completedBookingIds = existingRevenues
        .filter(revenue => revenue.booking && revenue.booking._id)
        .map(revenue => revenue.booking._id);

      // Update the completed bookings set
      setCompletedBookings(new Set(completedBookingIds));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchHalls();
    fetchTotalEarnings();
    checkExistingRevenueRecords();
  }, []);

  // Refresh data when component comes back into view
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBookings();
        fetchHalls();
      }
    };

    const handleFocus = () => {
      fetchBookings();
      fetchHalls();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');

    // If tab parameter is 'slots', switch to slots tab
    if (tab === 'slots') {
      setActiveTab('slots');
      // Clean up URL parameter after setting the tab
      navigate('/hall-owner/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  // Convert 24-hour time to 12-hour AM/PM format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings");
      setBookings(response.data);
      
      // Also refresh earnings when bookings are fetched
      fetchTotalEarnings();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHalls = async () => {
    try {
      setHallsLoading(true);
      const response = await axios.get("/api/halls/my-halls");
      setHalls(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setHallsLoading(false);
    }
  };

  const fetchTotalEarnings = async () => {
    try {
      setEarningsLoading(true);

      // Use the new OwnerRevenue collection for more accurate revenue tracking
      const response = await axios.get("/api/owner-revenue/total");

      const total = response.data.totalRevenue || 0;

      // Ensure we always have a valid number
      setTotalEarnings(Math.max(0, total));
    } catch (error) {
      console.error(error);
      try {
        const fallbackResponse = await axios.get("/api/hallalloted/owner/my-allotments");

        const fallbackTotal = fallbackResponse.data.allotments?.reduce((sum, allotment) => {
          if (allotment.paymentStatus === 'paid' || allotment.status === 'completed') {
            return sum + (allotment.hallOwnerCommission || allotment.totalAmount || 0);
          }
          return sum;
        }, 0) || 0;

        setTotalEarnings(Math.max(0, fallbackTotal));
      } catch (fallbackError) {
        console.error(fallbackError);
        if (totalEarnings === 0) {
          setTotalEarnings(0);
        }
      }
    } finally {
      setEarningsLoading(false);
    }
  };

  const fetchSlots = async (hallId) => {
    try {
      const response = await axios.get(`/api/hallalloted/hall/${hallId}/all-slots`);
      setSlots(response.data);
    } catch (error) {
      console.error(error);
      setSlots([]);
    }
  };

  const fetchBookedSlots = async (hallId) => {
    try {
      const response = await axios.get(`/api/hallalloted/hall/${hallId}/bookings`);
      setBookedSlots(response.data);
    } catch (error) {
      console.error(error);
      setBookedSlots([]);
    }
  };

  const handleSlotFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "recurringDays") {
      const days = [...slotForm.recurringDays];
      if (checked) {
        days.push(value);
      } else {
        const index = days.indexOf(value);
        if (index > -1) days.splice(index, 1);
      }
      setSlotForm({ ...slotForm, recurringDays: days });
    } else {
      setSlotForm({
        ...slotForm,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const validateSlotForm = () => {
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      toast.error("Please fill all required fields");
      return false;
    }

    if (slotForm.startTime >= slotForm.endTime) {
      toast.error("Start time must be before end time");
      return false;
    }

    if (slotForm.isRecurring && (!slotForm.endDate || slotForm.recurringDays.length === 0)) {
      toast.error("Please select end date and recurring days");
      return false;
    }

    // Check for overlapping slots
    const newSlotDate = slotForm.date;
    const newStartTime = slotForm.startTime;
    const newEndTime = slotForm.endTime;

    // Check existing availability slots
    const overlappingSlot = slots.find(slot => {
      const slotDate = new Date(slot.allotmentDate).toISOString().split('T')[0];
      if (slotDate !== newSlotDate) return false;

      // Skip if editing the same slot
      if (editingSlot && slot._id === editingSlot._id) return false;

      // Check for time overlap
      return (newStartTime < slot.endTime && newEndTime > slot.startTime);
    });

    // Check existing bookings
    const overlappingBooking = bookedSlots.find(booking => {
      const bookingDate = new Date(booking.allotmentDate || booking.bookingDate).toISOString().split('T')[0];
      if (bookingDate !== newSlotDate) return false;

      // Check for time overlap
      return (newStartTime < booking.endTime && newEndTime > booking.startTime);
    });

    if (overlappingSlot) {
      toast.error(`Slot already exists: ${formatTime(overlappingSlot.startTime)} - ${formatTime(overlappingSlot.endTime)}`);
      return false;
    }

    if (overlappingBooking) {
      toast.error(`Time slot is already booked: ${formatTime(overlappingBooking.startTime)} - ${formatTime(overlappingBooking.endTime)}`);
      return false;
    }

    return true;
  };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    if (!validateSlotForm()) return;

    try {
      const slotData = {
        hall: selectedHall._id,
        allotmentDate: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        isRecurring: slotForm.isRecurring,
        recurringPattern: slotForm.isRecurring ? {
          frequency: "weekly",
          endDate: slotForm.endDate,
          occurrences: null
        } : null,
        recurringDays: slotForm.recurringDays,
        user: null,
        booking: null,
        totalAmount: 0,
        duration: calculateDuration(slotForm.startTime, slotForm.endTime),
        status: "available",
        paymentStatus: "not_applicable",
        notes: "Availability slot created by hall owner",
        isAvailabilitySlot: true
      };

      if (editingSlot) {
        await axios.put(`/api/hallalloted/${editingSlot._id}`, slotData);
        toast.success("Slot updated successfully");
      } else {
        await axios.post("/api/hallalloted", slotData);
        toast.success("Slot created successfully");
      }

      fetchSlots(selectedHall._id);
      resetSlotForm();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save slot");
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    return diffMs / (1000 * 60 * 60); // Convert to hours
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      const response = await axios.delete(`/api/hallalloted/${slotId}`);
      
      // Show appropriate success message based on what was deleted
      const deletedType = response.data.type;
      if (deletedType === 'availability_slot') {
        toast.success("Availability slot deleted successfully");
      } else {
        toast.success("Booking cancelled and slot deleted successfully");
      }
      
      // Refresh both slots and booked slots to update the UI
      fetchSlots(selectedHall._id);
      fetchBookedSlots(selectedHall._id);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Failed to delete slot";
      toast.error(errorMessage);
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      date: slot.allotmentDate.split('T')[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      isRecurring: slot.isRecurring || false,
      recurringDays: slot.recurringDays || [],
      endDate: slot.recurringPattern?.endDate ? slot.recurringPattern.endDate.split('T')[0] : ""
    });
    setShowSlotForm(true);
  };

  const resetSlotForm = () => {
    setSlotForm({
      date: "",
      startTime: "",
      endTime: "",
      isRecurring: false,
      recurringDays: [],
      endDate: ""
    });
    setEditingSlot(null);
    setShowSlotForm(false);
  };

  const isSlotBooked = (slot) => {
    return bookedSlots.some(booking => {
      const slotDate = new Date(slot.allotmentDate).toDateString();
      const bookingDate = new Date(booking.allotmentDate).toDateString();
      return slotDate === bookingDate &&
        slot.startTime < booking.endTime &&
        slot.endTime > booking.startTime &&
        booking.status !== "available"; // Only consider actual bookings, not availability slots
    });
  };

  const handleHallSelect = (hall) => {
    setSelectedHall(hall);
    fetchSlots(hall._id);
    fetchBookedSlots(hall._id);
  };

  const handleStatusUpdate = async (bookingId, status, amount = 0) => {
    try {
      if (status === "completed") {
        // Use the endpoint to create revenue record AND update booking status to completed
        const response = await axios.post('/api/owner-revenue/complete-booking', {
          bookingId
        });

        // Add booking to completed set to show "Payment Successful" text
        setCompletedBookings(prev => new Set([...prev, bookingId]));

        // Show success message
        toast.success(`Booking completed! ₹${response.data.details.commission.toLocaleString('en-IN')} added to earnings.`);

        // Refresh earnings and bookings to reflect status change
        fetchTotalEarnings();
        fetchBookings();

        return;
      }

      // For other status updates (confirm, cancel), use the original booking endpoint
      await axios.put(`/api/bookings/${bookingId}/status`, { status });

      // Refresh bookings list
      fetchBookings();

      toast.success(`Booking ${status} successfully!`);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        toast.error("Revenue record already exists for this booking");
        // Also add to completed set if revenue already exists
        setCompletedBookings(prev => new Set([...prev, bookingId]));
      } else {
        toast.error(error.response?.data?.message || "Failed to process booking");
      }
    }
  };

  if (loading) {
    return (
      <div className="hall-owner-dashboard">
        <div className="dashboard-header"></div>
        <div className="dashboard-layout">
          <div className="dashboard-content">
            {/* Action Buttons Skeleton */}
            <div className="action-buttons-section">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>

            {/* Stats Skeleton */}
            <DashboardStatsSkeleton />

            {/* Bookings Table Skeleton */}
            <div className="bookings-section">
              <div className="section-header">
                <div className="skeleton-heading"></div>
              </div>
              <HallTableSkeleton rows={8} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  return (
    <div className="hall-owner-dashboard">
      <div className="dashboard-header">
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-content">
          {/* Action Buttons */}
          <div className="action-buttons-section">
            <button
              className={`dashboard-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
            Dashboard
            </button>
            <button
              className={`slot-management-btn ${activeTab === "slots" ? "active" : ""}`}
              onClick={() => setActiveTab("slots")}
            >
              Manage Slots
            </button>
            <button
              className={`earnings-report-btn ${activeTab === "earnings" ? "active" : ""}`}
              onClick={() => navigate('/hall-owner/revenue')}
            >
              Earnings Report
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              <div className="dashboard-stats grid">
                <div className="stat-card">
                  <h3>Total Halls</h3>
                  <p className="stat-number">{halls.length}</p>
                  <Link to="/hall-owner/halls">Manage Halls</Link>
                </div>
                <div className="stat-card">
                  <h3>Pending Bookings</h3>
                  <p className="stat-number">{pendingBookings.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Confirmed Bookings</h3>
                  <p className="stat-number">{confirmedBookings.length}</p>
                </div>
          
                  <div className="stat-card earnings-card">
                    <h3>Total Earnings</h3>
                    {earningsLoading ? (
                      <p className="stat-number loading">Loading...</p>
                    ) : (
                      <p className="stat-number earnings">₹{totalEarnings.toLocaleString('en-IN')}</p>
                    )}
                    <span className="earnings-subtitle">From completed bookings</span>
                  </div>
          
              </div>

              <div className="bookings-section">
                <div className="section-header">
                  <div className="section-title">
                    <svg
                      width="24"
                      height="24"
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
                    <h2>Recent Bookings</h2>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="no-bookings-owner">
                    <div className="no-bookings-icon">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <h3>No bookings yet</h3>
                    <p>
                      Bookings will appear here once customers start booking
                      your halls
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="bookings-table">
                        <thead>
                          <tr>
                            <th>Hall Name</th>
                            <th>Customer</th>
                            <th>Phone</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings
                            .slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage)
                            .map((booking) => (
                          <tr key={booking._id}>
                            <td className="hall-name-cell">
                              {booking.hall?.name}
                            </td>
                            <td data-label="Customer">
                              {booking.user?.name || "N/A"}
                            </td>
                            <td data-label="Phone" className="phone-cell">
                              {booking.user?.phone ? (
                                <a
                                  href={`tel:${booking.user.phone}`}
                                  className="phone-link"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  {booking.user.phone}
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td data-label="Date">
                              {new Date(booking.bookingDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td data-label="Time" className="time-cell">
                              {formatTime(booking.startTime)} -{" "}
                              {formatTime(booking.endTime)}
                            </td>
                            <td data-label="Amount" className="amount-cell">
                              ₹{Math.abs(booking.totalAmount).toFixed(0)}
                            </td>
                            <td data-label="Status">
                              <span
                                className={`status-badge-table status-${booking.status}`}
                              >
                                {booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="actions-cell">
                              {booking.status === "cancelled" ? (
                                <span className="user-cancelled-text">🔴 User Cancelled</span>
                              ) : booking.status === "completed" || booking.paymentStatus === "paid" ? (
                                <span className="payment-successful-text">✅ Payment Successful</span>
                              ) : (
                                <span className="pending-payment-text">🟠 Pending Payment</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {bookings.length > bookingsPerPage && (
                    <div className="pagination-container">
                      <div className="pagination-info">
                        Showing {((currentPage - 1) * bookingsPerPage) + 1} to {Math.min(currentPage * bookingsPerPage, bookings.length)} of {bookings.length} bookings
                      </div>
                      <div className="pagination-controls">
                        <button
                          className="pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                          Previous
                        </button>
                        
                        <div className="pagination-pages">
                          {Array.from({ length: Math.ceil(bookings.length / bookingsPerPage) }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          className="pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(bookings.length / bookingsPerPage), prev + 1))}
                          disabled={currentPage === Math.ceil(bookings.length / bookingsPerPage)}
                        >
                          Next
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
                )}
              </div>
            </>
          )}

          {/* Slots Tab */}
          {activeTab === "slots" && (
            <div className="slots-section">
              {!selectedHall ? (
                <div className="hall-selection-1">
                  <div className="hall-selection-header">
                    <h2>Select a Hall to Manage Slots</h2>
                    <div className="hall-view-toggle">
                      <button
                        className={`view-btn ${hallView === "table" ? "active" : ""}`}
                        onClick={() => setHallView("table")}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="8" y1="6" x2="21" y2="6"></line>
                          <line x1="8" y1="12" x2="21" y2="12"></line>
                          <line x1="8" y1="18" x2="21" y2="18"></line>
                          <line x1="3" y1="6" x2="3.01" y2="6"></line>
                          <line x1="3" y1="12" x2="3.01" y2="12"></line>
                          <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                      </button>
                      <button
                        className={`view-btn ${hallView === "grid" ? "active" : ""}`}
                        onClick={() => setHallView("grid")}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {hallsLoading ? (
                    <HallSelectionSkeleton view={hallView} count={3} />
                  ) : hallView === "table" ? (
                    <div className="halls-table-container">
                      <table className="halls-table">
                        <thead>
                          <tr>
                            <th>Hall Image</th>
                            <th>Hall Name</th>
                            <th>Location</th>
                            <th>Price/Hour</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {halls.map((hall) => (
                            <tr
                              key={hall._id}
                              className={`hall-table-row ${highlightedHall === hall._id ? 'highlighted' : ''}`}
                              onClick={() => handleHallSelect(hall)}
                            >
                              <td className="hall-image-cell">
                                <div className="table-hall-image">
                                  {highlightedHall === hall._id && (
                                    <div className="new-hall-badge-table">
                                      <span>✨ New!</span>
                                    </div>
                                  )}
                                  <img
                                    src={hall.images && hall.images.length > 0
                                      ? (hall.images[0].startsWith('http')
                                        ? hall.images[0]
                                        : `http://localhost:5000/${hall.images[0]}`)
                                      : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop'
                                    }
                                    alt={hall.name}
                                    className="table-hall-img"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop';
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="hall-name-cell">
                                <div className="hall-name-content">
                                  <h3>{hall.name}</h3>
                                </div>
                              </td>
                              <td className="location-cell">
                                <div className="location-content">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  <div>
                                    <div className="city">{hall.location?.city}</div>
                                    <div className="state">{hall.location?.state}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="price-cell">
                                <div className="price-content">
                                  <span className="currency">₹</span>
                                  <span className="amount">{hall.pricePerHour}</span>
                                  <span className="period">/hour</span>
                                </div>
                              </td>
                              <td className="action-cell">
                                <button className="manage-slots-btn-table">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
                                  </svg>
                                  Manage Slots
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="hall-grid-1">
                      {halls.map((hall) => (
                        <div
                          key={hall._id}
                          className={`hall-card-slot-1 ${highlightedHall === hall._id ? 'highlighted' : ''}`}
                          onClick={() => handleHallSelect(hall)}
                        >
                          <div className="hall-info-1">
                            {highlightedHall === hall._id && (
                              <div className="new-hall-badge">
                                <span>✨ Just Added!</span>
                              </div>
                            )}
                            <div className="hall-image-section">
                              <img
                                src={hall.images && hall.images.length > 0
                                  ? (hall.images[0].startsWith('http')
                                    ? hall.images[0]
                                    : `http://localhost:5000/${hall.images[0]}`)
                                  : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop'
                                }
                                alt={hall.name}
                                className="hall-image"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop';
                                }}
                              />
                            </div>
                            <div className="hall-info-content">
                              <h3>{hall.name}</h3>
                              <p className="location-section-1">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="3">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {hall.location?.city}, {hall.location?.state}
                              </p>
                              <p className="hall-price-1">
                                ₹{hall.pricePerHour}/hour
                              </p>
                            </div>
                          </div>
                          <div className="hall-action-1" >
                            <button className="manage-slots-btn-1">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
                              </svg>
                              Manage Slots
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!hallsLoading && halls.length === 0 && (
                    <div className="no-halls-message">
                      <div className="no-halls-icon">🏢</div>
                      <h3>No halls found</h3>
                      <p>Add your first hall to start managing slots</p>
                      <Link to="/hall-owner/halls" className="add-hall-btn">
                        Add Your First Hall
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="slot-management">
                  <div className="slot-header">
                    <div className="slot-header-left">
                      <button
                        onClick={() => setSelectedHall(null)}
                        className="back-btn-1"
                      >
                        ← Back to Halls
                      </button>
                      <h2>Managing: {selectedHall.name}</h2>
                    </div>
                    <div className="slot-header-actions">
                      <div className="view-toggle">
                        <button
                          className={`view-btn ${slotView === "list" ? "active" : ""}`}
                          onClick={() => setSlotView("list")}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                          </svg>
                          {/* List */}
                        </button>
                        <button
                          className={`view-btn ${slotView === "calendar" ? "active" : ""}`}
                          onClick={() => setSlotView("calendar")}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {/* Calendar */}
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Slot Statistics */}
                  <div className="slot-stats">
                    <div className="stat-item">
                      <div className="stat-icon total">📅</div>
                      <div className="stat-content">
                        <span className="stat-number">{slots.length}</span>
                        <span className="stat-label">Total Slots</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon booked">🎯</div>
                      <div className="stat-content">
                        <span className="stat-number">{bookedSlots.length}</span>
                        <span className="stat-label">Booked</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon available">✅</div>
                      <div className="stat-content">
                        <span className="stat-number">{Math.max(0, slots.length - bookedSlots.length)}</span>
                        <span className="stat-label">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Slot Form Modal */}
                  {showSlotForm && (
                    <div className="slot-form-modal">
                      <div className="slot-form-overlay" onClick={resetSlotForm}></div>
                      <div className="slot-form-container">
                        <div className="slot-form-header">
                          <h3>{editingSlot ? "Edit Slot" : "Add New Slot"}</h3>
                          <button onClick={resetSlotForm} className="close-btn">×</button>
                        </div>
                        <form onSubmit={handleSlotSubmit} className="slot-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Date *</label>
                              <input
                                type="date"
                                name="date"
                                value={slotForm.date}
                                onChange={handleSlotFormChange}
                                min={(() => {
                                  const today = new Date();
                                  return today.toISOString().split('T')[0];
                                })()}
                                required
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                              />
                            </div>
                            <div className="form-group">
                              <label>Start Time *</label>
                              <input
                                type="time"
                                name="startTime"
                                value={slotForm.startTime}
                                onChange={handleSlotFormChange}
                                required
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                              />
                            </div>
                            <div className="form-group">
                              <label>End Time *</label>
                              <input
                                type="time"
                                name="endTime"
                                value={slotForm.endTime}
                                onChange={handleSlotFormChange}
                                required
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                name="isRecurring"
                                checked={slotForm.isRecurring}
                                onChange={handleSlotFormChange}
                              />
                              <span className="checkmark"></span>
                              Create recurring slots
                            </label>
                          </div>

                          {slotForm.isRecurring && (
                            <>
                              <div className="form-group">
                                <label>End Date *</label>
                                <input
                                  type="date"
                                  name="endDate"
                                  value={slotForm.endDate}
                                  onChange={handleSlotFormChange}
                                  min={slotForm.date}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Recurring Days *</label>
                                <div className="days-selector">
                                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                    <label key={day} className="day-checkbox">
                                      <input
                                        type="checkbox"
                                        name="recurringDays"
                                        value={day}
                                        checked={slotForm.recurringDays.includes(day)}
                                        onChange={handleSlotFormChange}
                                      />
                                      <span className="day-label">{day.slice(0, 3)}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          <div className="form-actions">
                            <button type="button" onClick={resetSlotForm} className="btn-secondary">
                              Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                              {editingSlot ? "Update Slot" : "Create Slot"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Slot Content */}
                  <div className="slot-content">
                    {slotView === "list" ? (
                      <div className="slots-list">
                        {slots.length === 0 ? (
                          <div className="empty-slots">
                            <div className="empty-slots-icon">📅</div>
                            <h3>No slots created yet</h3>
                            <p>Create your first availability slot to start accepting bookings</p>
                            <button onClick={() => setShowSlotForm(true)} className="create-first-slot-btn">
                              Create First Slot
                            </button>
                          </div>
                        ) : (
                          <div className="slots-grid">
                            {slots.map((slot) => {
                              const isBooked = isSlotBooked(slot);
                              // Also consider slots that are not availability slots as "booked"
                              const isBookedOrNonAvailable = isBooked || 
                                (slot.status && slot.status !== "available") || 
                                (!slot.isAvailabilitySlot && slot.user) ||
                                (slot.booking);
                              
                              return (
                                <div key={slot._id} className={`slot-card ${isBookedOrNonAvailable ? "booked" : "available"}`}>
                                  <div className="slot-card-header">
                                    <div className="slot-date">
                                      {new Date(slot.allotmentDate).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                      })}
                                    </div>
                                    <div className={`slot-status ${isBookedOrNonAvailable ? "booked" : "available"}`}>
                                      {isBookedOrNonAvailable ? "Booked" : "Available"}
                                    </div>
                                  </div>
                                  <div className="slot-time">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <polyline points="12,6 12,12 16,14"></polyline>
                                    </svg>
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </div>
                                  {slot.isRecurring && (
                                    <div className="slot-recurring">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98"></path>
                                        <path d="M17 3l4 4-4 4"></path>
                                      </svg>
                                      Recurring
                                    </div>
                                  )}
                                  <div className="slot-actions">
                                    <button
                                      onClick={() => handleEditSlot(slot)}
                                      className="slot-action-btn edit"
                                      disabled={isBookedOrNonAvailable && !slot.isAvailabilitySlot}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this slot from the database?')) {
                                          handleDeleteSlot(slot._id);
                                        }
                                      }}
                                      className="slot-action-btn delete"
                                      title="Delete slot from database"
                                      disabled={isBookedOrNonAvailable}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3,6 5,6 21,6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="calendar-view">
                        <Calendar
                          selectedHall={selectedHall}
                          slots={slots}
                          bookedSlots={bookedSlots}
                          onDateSelect={(date) => {

                            setSlotForm(prev => ({ ...prev, date }));
                            setShowSlotForm(true);
                          }}
                          onSlotClick={(slot) => {
                            if (slot.status) {
                              // This is a booked slot, show booking details

                            } else {
                              // This is an available slot, allow editing
                              handleEditSlot(slot);
                            }
                          }}
                          onSlotCreate={(date, time) => {
                            setSlotForm(prev => ({
                              ...prev,
                              date,
                              startTime: time || '',
                              endTime: time ? (parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0') + ':00' : ''
                            }));
                            setShowSlotForm(true);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HallOwnerDashboard;
