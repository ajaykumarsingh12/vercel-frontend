import { useState, useEffect } from "react";
import "./Calendar.css";

// Simple toast notification system
const toast = {
  error: (message) => {
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
      setTimeout(() => document.body.removeChild(toastEl), 300);
    }, 3000);
  }
};

// Bottom sheet modal for mobile day slots
const DaySlotSheet = ({ date, slots, bookings, onClose, onSlotClick, onSlotCreate, formatTime }) => {
  const allSlots = [
    ...slots.map(s => ({ ...s, _type: 'available' })),
    ...bookings.map(s => ({ ...s, _type: 'booked' })),
  ].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="day-sheet-overlay" onClick={onClose}>
      <div className="day-sheet" onClick={e => e.stopPropagation()}>
        <div className="day-sheet-handle" />
        <div className="day-sheet-header">
          <div>
            <div className="day-sheet-title">{displayDate}</div>
            <div className="day-sheet-subtitle">
              {slots.length} available &bull; {bookings.length} booked
            </div>
          </div>
          <button className="day-sheet-close" onClick={onClose}>✕</button>
        </div>

        <div className="day-sheet-body">
          {allSlots.length === 0 ? (
            <div className="day-sheet-empty">No slots for this day</div>
          ) : (
            allSlots.map((slot, idx) => (
              <div
                key={idx}
                className={`day-sheet-slot ${slot._type}`}
                onClick={() => { onSlotClick && onSlotClick(slot); onClose(); }}
              >
                <div className="day-sheet-slot-dot" />
                <div className="day-sheet-slot-info">
                  <span className="day-sheet-slot-time">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                  <span className="day-sheet-slot-badge">
                    {slot._type === 'available' ? 'Available' : (slot.status || 'Booked')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="day-sheet-footer">
          <button
            className="day-sheet-add-btn"
            onClick={() => { onSlotCreate && onSlotCreate(date); onClose(); }}
          >
            + Add Slot
          </button>
        </div>
      </div>
    </div>
  );
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
  const [view, setView] = useState("month");
  const [calendarDays, setCalendarDays] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sheetData, setSheetData] = useState(null); // { date, slots, bookings }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
    // Get booked slots from the slots array (slots that are not available)
    const bookedFromSlots = slots.filter(slot => {
      const slotDate = formatDate(new Date(slot.date || slot.allotmentDate));
      const isMatch = slotDate === dateStr && (slot.status !== 'available' || !slot.isAvailabilitySlot);
      return isMatch;
    });
    
    // Get bookings from the bookedSlots array
    const bookedFromBookings = bookedSlots.filter(booking =>
      formatDate(new Date(booking.bookingDate || booking.allotmentDate)) === dateStr
    );
    
    // Remove duplicates by checking if a booking already exists in bookedFromSlots
    // Use a Set to track unique slot IDs
    const uniqueBookings = [];
    const seenIds = new Set();
    
    // Add slots first
    bookedFromSlots.forEach(slot => {
      const id = slot._id || slot.id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueBookings.push(slot);
      }
    });
    
    // Add bookings only if they don't already exist
    bookedFromBookings.forEach(booking => {
      const id = booking._id || booking.id;
      // Check if this booking is already in the slots array
      const isDuplicate = bookedFromSlots.some(slot => 
        (slot._id === id) || 
        (slot.bookingId === id) ||
        (slot.startTime === booking.startTime && slot.endTime === booking.endTime)
      );
      
      if (!isDuplicate && id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueBookings.push(booking);
      }
    });
    
    return uniqueBookings;
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

                  // Open bottom sheet on all devices
                  if (true) {
                    setSheetData({
                      date: formatDate(day),
                      slots: daySlots,
                      bookings: dayBookings,
                    });
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

                {/* Dot indicators for all devices */}
                <div className="day-dots">
                  {daySlots.length > 0 && (
                    <span className="day-dot-group">
                      <span className="day-dot available" />
                      <span className="day-dot-count available">{daySlots.length}</span>
                    </span>
                  )}
                  {dayBookings.length > 0 && (
                    <span className="day-dot-group">
                      <span className="day-dot booked" />
                      <span className="day-dot-count booked">{dayBookings.length}</span>
                    </span>
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
          {weekDays.map((day, index) => {
            const daySlotsCount = getSlotsForDate(day).length;
            const dayBookingsCount = getBookedSlotsForDate(day).length;
            return (
              <div key={index} className={`day-header ${isToday(day) ? 'today' : ''}`}>
                <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="day-date">{day.getDate()}</div>
                <div className="week-header-dots">
                  {daySlotsCount > 0 && (
                    <span className="day-dot-group">
                      <span className="day-dot available" />
                      <span className="day-dot-count available">{daySlotsCount}</span>
                    </span>
                  )}
                  {dayBookingsCount > 0 && (
                    <span className="day-dot-group">
                      <span className="day-dot booked" />
                      <span className="day-dot-count booked">{dayBookingsCount}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
                        const cellSlots = getSlotsForDate(day);
                        const cellBookings = getBookedSlotsForDate(day);
                        if (cellSlots.length > 0 || cellBookings.length > 0) {
                          setSheetData({ date: formatDate(day), slots: cellSlots, bookings: cellBookings });
                        } else {
                          onSlotCreate && onSlotCreate(formatDate(day), timeSlot);
                        }
                      }
                    }}
                  >
                    {hourSlots.length > 0 && (
                      <div className="week-cell-dots">
                        {hourSlots.filter(s => s.status === 'available' && s.isAvailabilitySlot).length > 0 && (
                          <span className="day-dot available" title="Available" />
                        )}
                        {hourSlots.filter(s => !(s.status === 'available' && s.isAvailabilitySlot)).length > 0 && (
                          <span className="day-dot booked" title="Booked" />
                        )}
                      </div>
                    )}
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
          <div className="day-view-header-top">
            <h3>{currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</h3>
            <div className="day-view-dots">
              {daySlots.length > 0 && (
                <span className="day-dot-group">
                  <span className="day-dot available" />
                  <span className="day-dot-count available">{daySlots.length} available</span>
                </span>
              )}
              {dayBookings.length > 0 && (
                <span className="day-dot-group">
                  <span className="day-dot booked" />
                  <span className="day-dot-count booked">{dayBookings.length} booked</span>
                </span>
              )}
            </div>
          </div>
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
                      if (daySlots.length > 0 || dayBookings.length > 0) {
                        setSheetData({ date: formatDate(currentDate), slots: daySlots, bookings: dayBookings });
                      } else {
                        onSlotCreate && onSlotCreate(formatDate(currentDate), timeSlot);
                      }
                    }
                  }}
                >
                  {hourSlots.length > 0 && (
                    <div className="week-cell-dots">
                      {hourSlots.filter(s => s.status === 'available' && s.isAvailabilitySlot).length > 0 && (
                        <span className="day-dot available" title="Available" />
                      )}
                      {hourSlots.filter(s => !(s.status === 'available' && s.isAvailabilitySlot)).length > 0 && (
                        <span className="day-dot booked" title="Booked" />
                      )}
                    </div>
                  )}
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

      {/* Mobile bottom sheet */}
      {sheetData && (
        <DaySlotSheet
          date={sheetData.date}
          slots={sheetData.slots}
          bookings={sheetData.bookings}
          onClose={() => setSheetData(null)}
          onSlotClick={onSlotClick}
          onSlotCreate={onSlotCreate}
          formatTime={formatTime}
        />
      )}
    </div>
  );
};

export default Calendar;