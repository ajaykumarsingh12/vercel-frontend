import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './HallCardSkeleton.css';

const HallCardSkeleton = () => {
  return (
    <div className="hall-card-skeleton">
      {/* Image skeleton */}
      <div className="skeleton-image">
        <Skeleton height={250} />
      </div>

      {/* Content skeleton */}
      <div className="skeleton-content">
        {/* Title */}
        <Skeleton height={28} width="80%" style={{ marginBottom: '12px' }} />
        
        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Skeleton circle width={16} height={16} />
          <Skeleton height={16} width="60%" />
        </div>

        {/* Details (Capacity & Price) */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <Skeleton height={14} width="50%" style={{ marginBottom: '6px' }} />
            <Skeleton height={20} width="70%" />
          </div>
          <div style={{ flex: 1 }}>
            <Skeleton height={14} width="50%" style={{ marginBottom: '6px' }} />
            <Skeleton height={20} width="70%" />
          </div>
        </div>

        {/* Button */}
        <Skeleton height={44} borderRadius={8} />
      </div>
    </div>
  );
};

export default HallCardSkeleton;
