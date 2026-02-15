import { useState, useEffect } from "react";
import "./Calendar.css";

// Simple toast notification system
const toast = {
  error: (message) => {
    // Create a simple toast notification
    const toastEl = document.createElement('div');
    toastEl.className = 'calendar-toast error';
    toastEl.textContent = message;
    toastEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toastEl);
      }, 300);
    }, 3000);
  }
};

const Calendar = ({
  selectedHall,
  slots = [],
  bookedSlots = [],
  onDateSelect,
  onSlotClick,
  onSlotCreate,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day
  const [calendarDays, setCalendarDays] = useState([]);

  // Sync scroll between weekdays and days
  useEffect(() => {
    const weekdaysWrapper = document.querySelector('.calendar-month > .calendar-scroll-wrapper:first-child');
    const daysWrapper = document.querySelector('.calendar-month > .calendar-scroll-wrapper:last-child');

    if (weekdaysWrapper && daysWrapper) {
      const syncScroll = (source, target) => {
        target.scrollLeft = source.scrollLeft;
      };

      const handleWeekdaysScroll = () => syncScroll(weekdaysWrapper, daysWrapper);
      const handleDaysScroll = () => syncScroll(daysWrapper, weekdaysWrapper);

      weekdaysWrapper.addEventListener('scroll', handleWeekdaysScroll);
      daysWrapper.addEventListener('scroll', handleDaysScroll);

      return () => {
        weekdaysWrapper.removeEventListener('scroll', handleWeekdaysScroll);
        daysWrapper.removeEventListener('scroll', handleDaysScroll);
      };
    }
  }, [view]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, view]);

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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const navigate = (direction) => {
    switch (view) {
      case "month":
        navigateMonth(direction);
        break;
      case "week":
        navigateWeek(direction);
        break;
      case "day":
        navigateDay(direction);
        break;
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSlotsForDate = (date) => {
    const dateStr = formatDate(date);
    const availableSlots = slots.filter(slot => {
      const slotDate = formatDate(new Date(slot.date || slot.allotmentDate));
      const isMatch = slotDate === dateStr && slot.status === 'available' && slot.isAvailabilitySlot;
      return isMatch;
    });
    return availableSlots;
  };

  const getBookedSlotsForDate = (date) => {
    const dateStr = formatDate(date);
    const bookedFromSlots = slots.filter(slot => {
      const slotDate = formatDate(new Date(slot.date || slot.allotmentDate));
      const isMatch = slotDate === dateStr && (slot.status !== 'available' || !slot.isAvailabilitySlot);
      return isMatch;
    });
    const bookedFromBookings = bookedSlots.filter(booking =>
      formatDate(new Date(booking.bookingDate || booking.allotmentDate)) === dateStr
    );
    return [...bookedFromSlots, ...bookedFromBookings];
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

  const hasAvailableTimeSlots = (date) => {
    const daySlots = getSlotsForDate(date);
    const dayBookings = getBookedSlotsForDate(date);

    // If there are no slots at all, time is available
    if (daySlots.length === 0 && dayBookings.length === 0) {
      return true;
    }

    // Check if the entire day is booked (24 hours)
    const totalBookedHours = [...daySlots, ...dayBookings].reduce((total, slot) => {
      const start = new Date(`2000-01-01T${slot.startTime || '00:00'}`);
      const end = new Date(`2000-01-01T${slot.endTime || '23:59'}`);
      const hours = (end - start) / (1000 * 60 * 60);
      return total + hours;
    }, 0);

    // If less than 24 hours are booked, there's still time available
    return totalBookedHours < 24;
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

  const renderMonthView = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-month">
        <div className="calendar-scroll-wrapper">
          <div className="calendar-weekdays">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
        </div>
        <div className="calendar-scroll-wrapper">
          <div className="calendar-days">
            {calendarDays.map((day, index) => {
              const daySlots = getSlotsForDate(day);
              const dayBookings = getBookedSlotsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const hasAvailableTime = hasAvailableTimeSlots(day);

              return (
                <div
                  key={index}
                  className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'
                    } ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''
                    } ${isPastDate(day) ? 'past' : ''} ${!hasAvailableTime && !isPastDate(day) ? 'fully-booked' : ''
                    }`}
                  title={
                    isPastDate(day)
                    ? 'Cannot create slots for past dates'
                    : !hasAvailableTime
                      ? 'This date is fully booked'
                      : ''
                }
                onClick={() => {
                  if (isPastDate(day)) {
                    toast.error('Cannot create slots for past dates');
                    return;
                  }

                  if (!hasAvailableTime) {
                    toast.error('This date is fully booked. No available time slots.');
                    return;
                  }

                  const formattedDate = formatDate(day);
                  onDateSelect && onDateSelect(formattedDate);
                }}
                onTouchStart={(e) => {
                  // Add touched class for mobile devices
                  if (!isPastDate(day)) {
                    e.currentTarget.classList.add('touched');
                  }
                }}
                onTouchEnd={(e) => {
                  // Remove touched class after a delay
                  setTimeout(() => {
                    e.currentTarget.classList.remove('touched');
                  }, 3000);
                }}
                onMouseLeave={(e) => {
                  // Remove touched class when mouse leaves (for hybrid devices)
                  e.currentTarget.classList.remove('touched');
                }}
              >
                <div className="day-number">{day.getDate()}</div>
                <div className="day-slots">
                  {daySlots.slice(0, 2).map((slot, idx) => (
                    <div
                      key={idx}
                      className="slot-indicator available"
                      title={`Available: ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick && onSlotClick(slot);
                      }}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  ))}
                  {dayBookings.slice(0, 2).map((booking, idx) => (
                    <div
                      key={`booking-${idx}`}
                      className={`slot-indicator booked ${booking.status || 'confirmed'}`}
                      title={`Booked: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick && onSlotClick(booking);
                      }}
                    >
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </div>
                  ))}
                  {(daySlots.length + dayBookings.length) > 4 && (
                    <div className="more-slots">+{(daySlots.length + dayBookings.length) - 4}</div>
                  )}
                </div>
                {isCurrentMonth && !isPastDate(day) && hasAvailableTime && (
                  <button
                    className="add-slot-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const formattedDate = formatDate(day);
                      onSlotCreate && onSlotCreate(formattedDate);
                    }}
                    title="Add time slot"
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    const timeSlots = [];
    for (let hour = 6; hour < 24; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    return (
      <div className="calendar-week">
        <div className="week-header">
          <div className="time-column-header">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className={`day-header ${isToday(day) ? 'today' : ''}`}>
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="day-date">{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="week-body">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="time-row">
              <div className="time-label">{formatTime(timeSlot)}</div>
              {weekDays.map((day, dayIndex) => {
                const daySlots = getSlotsForDate(day);
                const dayBookings = getBookedSlotsForDate(day);
                const hourSlots = [...daySlots, ...dayBookings].filter(slot => {
                  const slotHour = parseInt((slot.startTime || '').split(':')[0]);
                  const currentHour = parseInt(timeSlot.split(':')[0]);
                  return slotHour === currentHour;
                });

                return (
                  <div
                    key={dayIndex}
                    className={`time-cell ${isPastDate(day) ? 'past' : ''}`}
                    onClick={() => {
                      if (!isPastDate(day)) {
                        onSlotCreate && onSlotCreate(formatDate(day), timeSlot);
                      }
                    }}
                  >
                    {hourSlots.map((slot, slotIndex) => (
                      <div
                        key={slotIndex}
                        className={`week-slot ${slot.status === 'available' && slot.isAvailabilitySlot ? 'available' : 'booked'
                          } ${slot.status || ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotClick && onSlotClick(slot);
                        }}
                        title={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                      >
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = [];
    for (let hour = 6; hour < 24; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    const daySlots = getSlotsForDate(currentDate);
    const dayBookings = getBookedSlotsForDate(currentDate);

    return (
      <div className="calendar-day-view">
        <div className="day-view-header">
          <h3>{currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</h3>
        </div>
        <div className="day-view-body">
          {timeSlots.map((timeSlot) => {
            const hourSlots = [...daySlots, ...dayBookings].filter(slot => {
              const slotHour = parseInt((slot.startTime || '').split(':')[0]);
              const currentHour = parseInt(timeSlot.split(':')[0]);
              return slotHour === currentHour;
            });

            return (
              <div key={timeSlot} className="day-time-row">
                <div className="day-time-label">{formatTime(timeSlot)}</div>
                <div
                  className={`day-time-cell ${isPastDate(currentDate) ? 'past' : ''}`}
                  onClick={() => {
                    if (!isPastDate(currentDate)) {
                      onSlotCreate && onSlotCreate(formatDate(currentDate), timeSlot);
                    }
                  }}
                >
                  {hourSlots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`day-slot ${slot.status === 'available' && slot.isAvailabilitySlot ? 'available' : 'booked'
                        } ${slot.status || ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick && onSlotClick(slot);
                      }}
                    >
                      <div className="slot-time">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      {slot.user && (
                        <div className="slot-user">{slot.user.name}</div>
                      )}
                      {slot.specialRequests && (
                        <div className="slot-notes">{slot.specialRequests}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button onClick={() => navigate(-1)} className="nav-btn">
            &#8249;
          </button>
          <h2 className="calendar-title">
            {view === "month" && getMonthName(currentDate)}
            {view === "week" && `Week of ${currentDate.toLocaleDateString()}`}
            {view === "day" && currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <button onClick={() => navigate(1)} className="nav-btn">
            &#8250;
          </button>
        </div>
        <div className="calendar-controls">
          <div className="view-switcher">
            <button
              className={`view-btn ${view === "month" ? "active" : ""}`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`view-btn ${view === "week" ? "active" : ""}`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`view-btn ${view === "day" ? "active" : ""}`}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>
          <button
            className="today-btn"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>

      <div className="calendar-content">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>

      {selectedHall && (
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available Slots</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked confirmed"></div>
            <span>Confirmed Bookings</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked pending"></div>
            <span>Pending Bookings</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked cancelled"></div>
            <span>Cancelled Bookings</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;