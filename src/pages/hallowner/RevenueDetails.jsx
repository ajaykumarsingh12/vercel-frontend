import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/commons/Loader";
import "./RevenueDetails.css";

const RevenueDetails = () => {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalPlatformFees: 0
  });
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    hall: ""
  });
  const [halls, setHalls] = useState([]);

  useEffect(() => {
    fetchRevenues();
    fetchTotalStats();
    fetchHalls();
  }, []);

  useEffect(() => {
    fetchRevenues();
    fetchTotalStats();
  }, [filters]);

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.hall) params.append('hall', filters.hall);

      const response = await axios.get(`/api/owner-revenue?${params.toString()}`);
      setRevenues(response.data.revenues || []);
    } catch (error) {
      console.error(error);
      setRevenues([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`/api/owner-revenue/total?${params.toString()}`);
      setTotalStats(response.data);
    } catch (error) {
      console.error(error);
      setTotalStats({ totalRevenue: 0, totalBookings: 0, totalPlatformFees: 0 });
    }
  };

  const fetchHalls = async () => {
    try {
      const response = await axios.get("/api/halls/my-halls");
      setHalls(response.data);
    } catch (error) {
      console.error(error);
      setHalls([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", hall: "" });
  };

  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) return <Loader />;

  return (
    <div className="revenue-details">
      <div className="revenue-header">
        <div className="header-left">
          <Link to="/hall-owner/dashboard" className="back-btn">
            ← Back to Dashboard
          </Link>
          <h1>Revenue Details</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="revenue-stats">
        <div className="stat-card revenue-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">₹{totalStats.totalRevenue.toLocaleString('en-IN')}</p>
          <span className="stat-subtitle">Your earnings</span>
        </div>
        <div className="stat-card bookings-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{totalStats.totalBookings}</p>
          <span className="stat-subtitle">Completed bookings</span>
        </div>
        <div className="stat-card fees-card">
          <h3>Platform Fees</h3>
          <p className="stat-number">₹{totalStats.totalPlatformFees.toLocaleString('en-IN')}</p>
          <span className="stat-subtitle">Fees paid</span>
        </div>
      </div>

      {/* Filters */}
      <div className="revenue-filters">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Hall</label>
          <select
            name="hall"
            value={filters.hall}
            onChange={handleFilterChange}
          >
            <option value="">All Halls</option>
            {halls.map(hall => (
              <option key={hall._id} value={hall._id}>{hall.name}</option>
            ))}
          </select>
        </div>
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      {/* Revenue Table */}
      <div className="revenue-table-container">
        {revenues.length === 0 ? (
          <div className="no-revenue">
            <div className="no-revenue-icon">💰</div>
            <h3>No revenue records found</h3>
            <p>Revenue records will appear here when bookings are completed</p>
          </div>
        ) : (
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Hall Name</th>
                <th>Customer Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Total Amount</th>
                <th>Your Commission</th>
                <th>Platform Fee</th>
                <th>Status</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {revenues.map((revenue) => (
                <tr key={revenue._id}>
                  <td className="hall-name-cell">
                    {revenue.hallName}
                  </td>
                  <td className="phone-cell">
                    <a href={`tel:${revenue.customerPhone}`} className="phone-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {revenue.customerPhone}
                    </a>
                  </td>
                  <td className="date-cell">
                    {new Date(revenue.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="time-cell">
                    {formatTime(revenue.startTime)} - {formatTime(revenue.endTime)}
                  </td>
                  <td className="amount-cell">
                    ₹{revenue.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="commission-cell">
                    ₹{revenue.hallOwnerCommission.toLocaleString('en-IN')}
                  </td>
                  <td className="fee-cell">
                    ₹{revenue.platformFee.toLocaleString('en-IN')}
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${revenue.status}`}>
                      {revenue.status.charAt(0).toUpperCase() + revenue.status.slice(1)}
                    </span>
                  </td>
                  <td className="completed-cell">
                    {new Date(revenue.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RevenueDetails;