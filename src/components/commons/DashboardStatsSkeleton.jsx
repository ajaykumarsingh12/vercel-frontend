import "./DashboardStatsSkeleton.css";

const DashboardStatsSkeleton = () => {
  return (
    <div className="dashboard-stats grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="stat-card-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-number"></div>
          <div className="skeleton-link"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatsSkeleton;
