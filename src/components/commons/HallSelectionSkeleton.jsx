import React from 'react';
import './HallSelectionSkeleton.css';

const HallSelectionSkeleton = ({ view = 'table', count = 3 }) => {
  if (view === 'table') {
    return (
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
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index} className="hall-skeleton-row">
                <td className="hall-image-cell">
                  <div className="skeleton-hall-image skeleton-shimmer"></div>
                </td>
                <td className="hall-name-cell">
                  <div className="skeleton-hall-name skeleton-shimmer"></div>
                </td>
                <td className="location-cell">
                  <div className="skeleton-location">
                    <div className="skeleton-icon skeleton-shimmer"></div>
                    <div className="skeleton-location-text">
                      <div className="skeleton-city skeleton-shimmer"></div>
                      <div className="skeleton-state skeleton-shimmer"></div>
                    </div>
                  </div>
                </td>
                <td className="price-cell">
                  <div className="skeleton-price skeleton-shimmer"></div>
                </td>
                <td className="action-cell">
                  <div className="skeleton-action-btn skeleton-shimmer"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Grid view
  return (
    <div className="hall-grid-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="hall-card-skeleton-slot">
          <div className="skeleton-card-image skeleton-shimmer"></div>
          <div className="skeleton-card-content">
            <div className="skeleton-card-title skeleton-shimmer"></div>
            <div className="skeleton-card-location">
              <div className="skeleton-location-icon skeleton-shimmer"></div>
              <div className="skeleton-location-text skeleton-shimmer"></div>
            </div>
            <div className="skeleton-card-price skeleton-shimmer"></div>
            <div className="skeleton-card-button skeleton-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HallSelectionSkeleton;
