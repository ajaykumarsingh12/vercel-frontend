import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './BookingCardSkeleton.css';

const BookingCardSkeleton = () => {
  return (
    <div className="booking-card booking-card-skeleton">
      {/* Left Section - Hall Info */}
      <div className="booking-left-section">
        <div className="hall-header">
          <Skeleton 
            height={28} 
            width="60%" 
            style={{ maxWidth: '300px', minWidth: '150px' }} 
          />
          <Skeleton 
            height={32} 
            width={100} 
            borderRadius={50} 
          />
        </div>
        <div className="hall-details">
          <p className="location" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Skeleton circle width={20} height={20} />
            <Skeleton height={14} width="70%" style={{ maxWidth: '200px', minWidth: '120px' }} />
          </p>
          <p className="contact" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Skeleton circle width={20} height={20} />
            <Skeleton height={14} width="80%" style={{ maxWidth: '250px', minWidth: '150px' }} />
          </p>
        </div>
      </div>

      {/* Center Section - Detail Cards */}
      <div className="booking-center-section">
        <div className="detail-card">
          <span className="detail-label"><Skeleton height={11} width={40} /></span>
          <span className="detail-value"><Skeleton height={16} width={80} /></span>
        </div>
        <div className="detail-card">
          <span className="detail-label"><Skeleton height={11} width={35} /></span>
          <span className="detail-value"><Skeleton height={16} width={100} /></span>
        </div>
        <div className="detail-card">
          <span className="detail-label"><Skeleton height={11} width={60} /></span>
          <span className="detail-value"><Skeleton height={16} width={70} /></span>
        </div>
        <div className="detail-card">
          <span className="detail-label"><Skeleton height={11} width={50} /></span>
          <span className="detail-value amount"><Skeleton height={18} width={90} /></span>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="booking-actions">
        <Skeleton height={44} borderRadius={50} style={{ width: '100%' }} />
        <Skeleton height={44} borderRadius={50} style={{ width: '100%' }} />
      </div>
    </div>
  );
};

export default BookingCardSkeleton;
