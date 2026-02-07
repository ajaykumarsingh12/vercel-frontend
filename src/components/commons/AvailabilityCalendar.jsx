import { useState, useEffect } from "react";
import axios from "axios";
import "./AvailabilityCalendar.css";

const AvailabilityCalendar = ({ hallId, onSlotSelect, selectedDate, onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  useEffect(() => {
    if (hallId) {
      fetchAvailability();
    }
  }, [hallId, currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Get all hall allotments from hallalloteds collection
      const allotmentsResponse = await axios.get(`/api/hallalloted/hall/${hallId}/all`);
      const allAllotments = allotmentsResponse.data;

      // Separate available slots and booked slots
      const available = allAllotments.filter(slot =>
        slot.status === 'available' && slot.isAvailabilitySlot
      );
      const booked = allAllotments.filter(slot =>
        slot.status !== 'available' || !slot.isAvailabilitySlot
      );

      setAvailableSlots(available);
      setBookedSlots(booked);
    } catch (error) {
      console.error(error);
      // Fallback to original endpoints
      try {
        const [slotsResponse, bookingsResponse] = await Promise.all([
          axios.get(`/api/hallalloted/hall/${hallId}/availability`),
          axios.get(`/api/bookings/availability/${hallId}`)
        ]);
        setAvailableSlots(slotsResponse.data);
        setBookedSlots(bookingsResponse.data);
      } catch (fallbackError) {
        console.error(fallbackError);
        setAvailableSlots([]);
        setBookedSlots([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSlotsForDate = (date) => {
    const dateStr = formatDate(date);
    const available = availableSlots.filter(slot =>
      formatDate(new Date(slot.allotmentDate)) === dateStr
    );
    const booked = bookedSlots.filter(booking =>
      formatDate(new Date(booking.bookingDate)) === dateStr
    );
    return { available, booked };
  };

  const isToday = (date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isSelected = (date) => {
    return selectedDate && formatDate(date) === formatDate(new Date(selectedDate));
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleDateClick = (date) => {
    if (isPastDate(date)) return;

    const dateStr = formatDate(date);
    const { available, booked } = getSlotsForDate(date);

    if (onDateChange) {
      onDateChange(dateStr);
    }

    // If there are available slots, show them
    if (available.length > 0) {
      // You can emit an event or call a callback to show available slots for this date

    }
  };

  const handleSlotClick = (slot, isBooked = false) => {
    if (isBooked || isPastDate(new Date(slot.allotmentDate || slot.bookingDate))) return;

    if (onSlotSelect) {
      onSlotSelect({
        date: slot.allotmentDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slot: slot
      });
    }
  };

  if (loading) {
    return (
      <div className="availability-calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <button
          onClick={() => navigateMonth(-1)}
          className="nav-btn"
          disabled={loading}
        >
          &#8249;
        </button>
        <h3 className="calendar-title">{getMonthName(currentDate)}</h3>
        <button
          onClick={() => navigateMonth(1)}
          className="nav-btn"
          disabled={loading}
        >
          &#8250;
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {calendarDays.map((day, index) => {
          const { available, booked } = getSlotsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const hasAvailability = available.length > 0;
          const hasBookings = booked.length > 0;

          return (
            <div
              key={index}
              className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'
                } ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''
                } ${isPastDate(day) ? 'past' : ''} ${hasAvailability ? 'has-availability' : ''
                }`}
              title={isPastDate(day) ? 'Cannot select past dates' : ''}
              onClick={() => handleDateClick(day)}
            >
              <div className="day-number">{day.getDate()}</div>

              {isCurrentMonth && !isPastDate(day) && (
                <div className="day-slots">
                  {available.slice(0, 2).map((slot, idx) => (
                    <div
                      key={idx}
                      className="slot-indicator available"
                      title={`Available: ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotClick(slot);
                      }}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  ))}

                  {booked.slice(0, 2).map((booking, idx) => (
                    <div
                      key={`booking-${idx}`}
                      className={`slot-indicator booked ${booking.status}`}
                      title={`Unavailable: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
                    >
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </div>
                  ))}

                  {(available.length + booked.length) > 4 && (
                    <div className="more-slots">
                      +{(available.length + booked.length) - 4}
                    </div>
                  )}
                </div>
              )}

              {isCurrentMonth && hasAvailability && !isPastDate(day) && (
                <div className="availability-indicator">
                  <div className="availability-dot"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot booked"></div>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot today"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;