/**
 * Calculate the total hours between two time strings
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Total hours (decimal)
 */
export const calculateTotalHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  // Parse time strings
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  // Convert to minutes from midnight
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight bookings (end time is next day)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  const diffMinutes = endMinutes - startMinutes;
  const diffHours = diffMinutes / 60;

  return Math.max(0, diffHours);
};

/**
 * Calculate detailed duration breakdown (days, hours, minutes)
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {object} Duration breakdown object
 */
export const calculateDetailedDuration = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return { days: 0, hours: 0, minutes: 0, totalMinutes: 0, totalHours: 0 };
  }

  // Parse time strings
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  // Convert to minutes from midnight
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight bookings (end time is next day)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  const totalMinutes = endMinutes - startMinutes;
  const totalHours = totalMinutes / 60;

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return {
    days,
    hours,
    minutes,
    totalMinutes: Math.max(0, totalMinutes),
    totalHours: Math.max(0, totalHours)
  };
};

/**
 * Calculate total amount based on hours and price per hour
 * @param {number} hours - Total hours
 * @param {number} pricePerHour - Price per hour in rupees
 * @returns {number} Total amount
 */
export const calculateTotalAmount = (hours, pricePerHour) => {
  if (!hours || !pricePerHour || hours <= 0 || pricePerHour <= 0) return 0;
  const amount = hours * pricePerHour;
  return Math.max(0, Math.round(amount));
};

/**
 * Format hours to display nicely (e.g., "2.5 hours" or "3 hours")
 * @param {number} hours - Hours to format
 * @returns {string} Formatted hours string
 */
export const formatHours = (hours) => {
  if (!hours || hours <= 0) return "0 hours";
  if (hours === 1) return "1 hour";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours} hour${wholeHours > 1 ? 's' : ''}`;
  } else if (wholeHours === 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${wholeHours} hour${wholeHours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

/**
 * Format detailed duration (days, hours, minutes)
 * @param {object} duration - Duration object with days, hours, minutes
 * @returns {string} Formatted duration string
 */
export const formatDetailedDuration = (duration) => {
  const { days, hours, minutes } = duration;
  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return '0 minutes';
  }

  return parts.join(', ');
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  const validAmount = Math.max(0, Math.round(amount || 0));
  return `${currency}${validAmount.toLocaleString('en-IN')}`;
};

/**
 * Calculate pricing breakdown
 * @param {number} hours - Total hours
 * @param {number} pricePerHour - Price per hour
 * @returns {object} Pricing breakdown object
 */
export const calculatePricingBreakdown = (hours, pricePerHour) => {
  // Ensure positive values
  const validHours = Math.max(0, hours || 0);
  const validPricePerHour = Math.max(0, pricePerHour || 0);
  const totalAmount = calculateTotalAmount(validHours, validPricePerHour);

  return {
    hours: validHours,
    pricePerHour: validPricePerHour,
    totalAmount,
    formattedHours: formatHours(validHours),
    formattedAmount: formatCurrency(totalAmount),
    formattedPricePerHour: formatCurrency(validPricePerHour)
  };
};


