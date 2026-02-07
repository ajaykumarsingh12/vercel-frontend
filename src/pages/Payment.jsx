import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/commons/Loader";
import { calculateTotalHours, formatCurrency } from "../utils/calculations";
import "./Payment.css";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const bookingId = searchParams.get("booking");

  // Format time to 12-hour AM/PM format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format duration to hours and minutes
  const formatDuration = (totalHours) => {
    const hours = Math.floor(Math.abs(totalHours));
    const minutes = Math.round((Math.abs(totalHours) - hours) * 60);

    if (hours === 0 && minutes === 0) return "0 minutes";
    if (hours === 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    if (minutes === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      fetchPaymentHistory();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(`/api/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
            console.error(error);
            toast.error("Failed to load booking details");
      navigate("/my-bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get("/api/payments/history");
      setPaymentHistory(response.data);
    } catch (error) {
            console.error(error);
            toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      // Initiate payment
      const initiateResponse = await axios.post("/api/payments/initiate", {
        bookingId: booking._id,
        paymentMethod,
      });

      const { orderId, amount, currency, key } = initiateResponse.data;

      // In a real implementation, you would integrate with Razorpay, Stripe, etc.
      // For demo purposes, we'll simulate the payment process

      // Simulate payment gateway
      setTimeout(async () => {
        try {
          // Verify payment (mock)
          const verifyResponse = await axios.post("/api/payments/verify", {
            bookingId: booking._id,
            paymentId: `pay_${Date.now()}`,
            orderId,
          });

          toast.success("Payment successful! Your booking is confirmed.");
          navigate("/my-bookings");
        } catch (error) {
          console.error(error);
          toast.error("Payment verification failed");
        } finally {
          setProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment initiation failed");
      setProcessing(false);
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm("Are you sure you want to request a refund?")) {
      return;
    }

    try {
      await axios.post(`/api/payments/refund/${bookingId}`);
      toast.success("Refund request submitted successfully");
      fetchPaymentHistory();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Refund request failed");
    }
  };

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "💳",
      description: "Visa, Mastercard, American Express",
    },
    {
      id: "upi",
      name: "UPI",
      icon: "📱",
      description: "Paytm, Google Pay, PhonePe, etc.",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: "🏦",
      description: "All major banks supported",
    },
  ];

  if (loading) return <Loader />;

  if (!bookingId) {
    // Payment History View
    return (
      <div className="payment-page">
        <div className="payment-header">
          <h1>Payment History</h1>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="no-payments">
            <div className="no-payments-icon">💳</div>
            <h3>No payment history</h3>
            <p>You haven't made any payments yet.</p>
          </div>
        ) : (
          <div className="payment-history">
            <div className="history-summary">
              <div className="summary-card">
                <h3>Total Paid</h3>
                <p className="amount">
                  ₹
                  {Math.round(
                    paymentHistory
                      .filter((p) => p.status === "paid")
                      .reduce((sum, p) => sum + p.amount, 0),
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h3>Refunds</h3>
                <p className="amount">
                  ₹
                  {Math.round(
                    paymentHistory
                      .filter((p) => p.status === "refunded")
                      .reduce((sum, p) => sum + p.amount, 0),
                  )}
                </p>
              </div>
            </div>

            <div className="history-list">
              <h2>Transaction History</h2>
              <div className="table-responsive">
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>HALL NAME</th>
                      <th>DATE</th>
                      <th>TIME</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td data-label="HALL NAME" className="hall-name">
                          {payment.hallName}
                        </td>
                        <td data-label="DATE">
                          {new Date(payment.bookingDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td data-label="TIME">
                          {payment.startTime && payment.endTime ? (
                            <>
                              {formatTime(payment.startTime)} -{" "}
                              {formatTime(payment.endTime)}
                            </>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td data-label="AMOUNT" className="amount-cell">
                          ₹{Math.round(payment.amount)}
                        </td>
                        <td data-label="STATUS">
                          <span className={`status-badge ${payment.status}`}>
                            {payment.status === "paid"
                              ? "CONFIRMED"
                              : payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td data-label="ACTIONS">
                          {payment.status === "paid" && (
                            <button
                              className="btn-action"
                              onClick={() => handleRefund(payment.bookingId)}
                            >
                              Refund
                            </button>
                          )}
                          {payment.status === "refunded" && (
                            <span className="text-muted">Refunded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Payment Form View
  if (!booking) {
    return (
      <div className="payment-page">
        <div className="error-state">
          <h2>Booking not found</h2>
          <p>The booking you're trying to pay for doesn't exist.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/my-bookings")}
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="booking-summary">
          <h2>Complete Your Payment</h2>
          <div className="booking-details">
            <div className="hall-info">
              <h3>{booking.hall?.name}</h3>
              <p className="location">
                📍 {booking.hall?.location?.city},{" "}
                {booking.hall?.location?.state}
              </p>
            </div>
            <div className="booking-info">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(booking.startTime)} -{" "}
                {formatTime(booking.endTime)}
              </p>
              <p>
                <strong>Duration:</strong> {formatDuration(booking.totalHours)}
              </p>
              <div className="pricing-breakdown">
                <p>
                  <strong>Price per hour:</strong>{" "}
                  {formatCurrency(
                    Math.round(booking.totalAmount / booking.totalHours),
                  )}
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  {formatCurrency(Math.round(booking.totalAmount))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-form">
          <div className="amount-section">
            <h3>Total Amount</h3>
            <div className="amount-display">
              <span className="currency">₹</span>
              <span className="amount">{Math.round(booking.totalAmount)}</span>
            </div>
          </div>

          <div className="payment-method-section">
            <h3>Select Payment Method</h3>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`payment-method-card ${paymentMethod === method.id ? "selected" : ""
                    }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                  <div className="method-radio">
                    <div
                      className={`radio ${paymentMethod === method.id ? "checked" : ""
                        }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/my-bookings")}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="spinner"></div>
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${Math.round(booking.totalAmount)}`
              )}
            </button>
          </div>
        </div>

        <div className="payment-security">
          <div className="security-info">
            <div className="security-icon">🔒</div>
            <div className="security-text">
              <h4>Secure Payment</h4>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
