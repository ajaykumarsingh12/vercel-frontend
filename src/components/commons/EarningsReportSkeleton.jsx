import "./EarningsReportSkeleton.css";

const EarningsReportSkeleton = () => {
  return (
    <div className="earnings-report-page">
      <div className="earnings-header">
        <div>
          <div className="skeleton-title"></div>
          <div className="skeleton-breadcrumb"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="earnings-stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="earnings-stat-card-skeleton">
            <div className="skeleton-icon"></div>
            <div className="stat-content-skeleton">
              <div className="skeleton-stat-title"></div>
              <div className="skeleton-stat-value"></div>
              <div className="skeleton-stat-subtitle"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings Overview Skeleton */}
      <div className="earnings-overview-section">
        <div className="overview-header">
          <div className="skeleton-section-title"></div>
          <div className="overview-controls-skeleton">
            <div className="skeleton-select"></div>
            <div className="skeleton-date-range"></div>
          </div>
        </div>

        <div className="overview-content">
          <div className="download-buttons">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>

          <div className="earnings-chart-table">
            {/* Table Skeleton */}
            <div className="earnings-table-section">
              <div className="skeleton-table-title"></div>
              <div className="earnings-table-skeleton">
                <div className="skeleton-table-header">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton-th"></div>
                  ))}
                </div>
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="skeleton-table-row">
                    {[1, 2, 3, 4, 5].map((col) => (
                      <div key={col} className="skeleton-td"></div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="skeleton-pagination"></div>
            </div>

            {/* Chart Skeleton */}
            <div className="earnings-chart-section">
              <div className="chart-header-skeleton">
                <div className="skeleton-chart-value"></div>
                <div className="skeleton-chart-toggle"></div>
              </div>
              
              <div className="bar-chart-skeleton">
                <div className="skeleton-y-axis">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton-y-label"></div>
                  ))}
                </div>
                <div className="skeleton-bars">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="skeleton-bar"></div>
                  ))}
                </div>
              </div>

              <div className="skeleton-chart-nav"></div>
              <div className="skeleton-chart-legend"></div>
              
              <div className="chart-stats-skeleton">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-chart-stat"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsReportSkeleton;
