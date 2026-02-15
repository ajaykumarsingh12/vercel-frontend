import './PaymentSkeleton.css';

const PaymentSkeleton = () => {
  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Booking Summary Skeleton */}
        <div className="booking-summary skeleton-container">
          <div className="skeleton-header">
            <div className="skeleton skeleton-title"></div>
          </div>

          <div className="booking-details">
            <div className="hall-info">
              <div className="skeleton skeleton-hall-name"></div>
              <div className="skeleton skeleton-location"></div>
            </div>

            <div className="booking-info-grid">
              <div className="info-item">
                <div className="skeleton skeleton-label"></div>
                <div className="skeleton skeleton-value"></div>
              </div>
              <div className="info-item">
                <div className="skeleton skeleton-label"></div>
                <div className="skeleton skeleton-value"></div>
              </div>
              <div className="info-item">
                <div className="skeleton skeleton-label"></div>
                <div className="skeleton skeleton-value"></div>
              </div>
            </div>

            <div className="pricing-details">
              <div className="pricing-row">
                <div className="skeleton skeleton-price-label"></div>
                <div className="skeleton skeleton-price-value"></div>
              </div>
              <div className="pricing-row">
                <div className="skeleton skeleton-price-label"></div>
                <div className="skeleton skeleton-price-value"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form Skeleton */}
        <div className="payment-form skeleton-container">
          {/* Amount Section */}
          <div className="amount-section">
            <div className="skeleton skeleton-section-title"></div>
            <div className="skeleton skeleton-amount"></div>
          </div>

          {/* Payment Method Section */}
          <div className="payment-method-section">
            <div className="skeleton skeleton-section-title"></div>
            <div className="payment-methods">
              <div className="skeleton-payment-method">
                <div className="skeleton-method-icon"></div>
                <div className="skeleton-method-content">
                  <div className="skeleton skeleton-method-name"></div>
                  <div className="skeleton skeleton-method-desc"></div>
                </div>
                <div className="skeleton-method-radio"></div>
              </div>
              <div className="skeleton-payment-method">
                <div className="skeleton-method-icon"></div>
                <div className="skeleton-method-content">
                  <div className="skeleton skeleton-method-name"></div>
                  <div className="skeleton skeleton-method-desc"></div>
                </div>
                <div className="skeleton-method-radio"></div>
              </div>
              <div className="skeleton-payment-method">
                <div className="skeleton-method-icon"></div>
                <div className="skeleton-method-content">
                  <div className="skeleton skeleton-method-name"></div>
                  <div className="skeleton skeleton-method-desc"></div>
                </div>
                <div className="skeleton-method-radio"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="payment-actions">
            <div className="skeleton skeleton-button"></div>
            <div className="skeleton skeleton-button skeleton-button-primary"></div>
          </div>
        </div>

        {/* Security Info Skeleton */}
        <div className="payment-security skeleton-container">
          <div className="security-info">
            <div className="skeleton-security-icon"></div>
            <div className="skeleton-security-content">
              <div className="skeleton skeleton-security-title"></div>
              <div className="skeleton skeleton-security-text"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSkeleton;
