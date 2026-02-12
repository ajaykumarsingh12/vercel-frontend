import React from 'react';
import './HallTableSkeleton.css';

const HallTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="table-container">
      <table className="halls-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Hall Name</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Price/Hour</th>
            <th>Status</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="skeleton-row">
              <td>
                <div className="skeleton-table-image skeleton-shimmer"></div>
              </td>
              <td>
                <div className="skeleton-text skeleton-text-lg skeleton-shimmer"></div>
              </td>
              <td>
                <div className="skeleton-text skeleton-text-md skeleton-shimmer"></div>
              </td>
              <td>
                <div className="skeleton-text skeleton-text-sm skeleton-shimmer"></div>
              </td>
              <td>
                <div className="skeleton-text skeleton-text-sm skeleton-shimmer"></div>
              </td>
              <td>
                <div className="skeleton-badge skeleton-shimmer"></div>
              </td>
              <td>
                <div className="skeleton-badge skeleton-shimmer"></div>
              </td>
              <td>
                <div className="skeleton-actions">
                  <div className="skeleton-btn skeleton-shimmer"></div>
                  <div className="skeleton-btn skeleton-shimmer"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HallTableSkeleton;
