import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../components/commons/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "./EarningsReport.css";

const EarningsReport = () => {
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    paidAmount: 0,
    pendingEarnings: 0,
    monthlyGrowth: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [viewType, setViewType] = useState("monthly"); // monthly, yearly
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [chartMonth, setChartMonth] = useState(new Date().getMonth()); // 0-11
  const [chartViewMode, setChartViewMode] = useState("yearly"); // yearly, monthly, daily
  const [currentWeek, setCurrentWeek] = useState(0); // For daily view pagination

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/owner-revenue/latest');
      const revenueData = response.data.revenues || [];
      setRevenues(revenueData);
      calculateStats(revenueData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch earnings data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (revenueData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const totalEarnings = revenueData.reduce((sum, rev) => sum + (rev.hallOwnerCommission || 0), 0);
    
    const thisMonthEarnings = revenueData
      .filter(rev => {
        const revDate = new Date(rev.date);
        return revDate.getMonth() === currentMonth && revDate.getFullYear() === currentYear;
      })
      .reduce((sum, rev) => sum + (rev.hallOwnerCommission || 0), 0);

    const lastMonthEarnings = revenueData
      .filter(rev => {
        const revDate = new Date(rev.date);
        return revDate.getMonth() === lastMonth && revDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, rev) => sum + (rev.hallOwnerCommission || 0), 0);

    const paidAmount = revenueData
      .filter(rev => rev.status === 'completed')
      .reduce((sum, rev) => sum + (rev.hallOwnerCommission || 0), 0);

    const pendingEarnings = revenueData
      .filter(rev => rev.status === 'pending')
      .reduce((sum, rev) => sum + (rev.hallOwnerCommission || 0), 0);

    const monthlyGrowth = lastMonthEarnings > 0 
      ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
      : 0;

    setStats({
      totalEarnings,
      thisMonth: thisMonthEarnings,
      paidAmount,
      pendingEarnings,
      monthlyGrowth
    });
  };

  const getMonthlyData = () => {
    const monthlyData = Array(12).fill(0);

    revenues.forEach(rev => {
      const revDate = new Date(rev.date);
      if (revDate.getFullYear() === chartYear) {
        const month = revDate.getMonth();
        monthlyData[month] += rev.hallOwnerCommission || 0;
      }
    });

    return monthlyData;
  };

  const getWeeklyDataForMonth = () => {
    // Get data for specific month broken down by weeks
    const weeksData = [0, 0, 0, 0, 0]; // Max 5 weeks in a month
    
    revenues.forEach(rev => {
      const revDate = new Date(rev.date);
      if (revDate.getFullYear() === chartYear && revDate.getMonth() === chartMonth) {
        const dayOfMonth = revDate.getDate();
        const weekIndex = Math.floor((dayOfMonth - 1) / 7);
        weeksData[weekIndex] += rev.hallOwnerCommission || 0;
      }
    });

    return weeksData.filter((_, index) => {
      // Only return weeks that exist in the month
      const daysInMonth = new Date(chartYear, chartMonth + 1, 0).getDate();
      return (index * 7 + 1) <= daysInMonth;
    });
  };

  const getDailyDataForMonth = () => {
    // Get data for specific month broken down by days
    const daysInMonth = new Date(chartYear, chartMonth + 1, 0).getDate();
    const dailyData = Array(daysInMonth).fill(0);
    
    revenues.forEach(rev => {
      const revDate = new Date(rev.date);
      if (revDate.getFullYear() === chartYear && revDate.getMonth() === chartMonth) {
        const dayOfMonth = revDate.getDate();
        dailyData[dayOfMonth - 1] += rev.hallOwnerCommission || 0;
      }
    });

    return dailyData;
  };

  const getWeeklyPaginatedData = () => {
    // Get 7 days of data for the current week
    const allDailyData = getDailyDataForMonth();
    const startIndex = currentWeek * 7;
    const endIndex = Math.min(startIndex + 7, allDailyData.length);
    return allDailyData.slice(startIndex, endIndex);
  };

  const getTotalWeeks = () => {
    const daysInMonth = new Date(chartYear, chartMonth + 1, 0).getDate();
    return Math.ceil(daysInMonth / 7);
  };

  const getAvailableYears = () => {
    const years = new Set();
    revenues.forEach(rev => {
      const year = new Date(rev.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const handlePreviousYear = () => {
    setChartYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    if (chartYear < currentYear) {
      setChartYear(prev => prev + 1);
    }
  };

  const handlePreviousMonth = () => {
    if (chartMonth === 0) {
      setChartMonth(11);
      setChartYear(prev => prev - 1);
    } else {
      setChartMonth(prev => prev - 1);
    }
    setCurrentWeek(0); // Reset to first week when changing month
  };

  const handleNextMonth = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    if (chartYear === currentYear && chartMonth === currentMonth) {
      return; // Can't go beyond current month
    }
    
    if (chartMonth === 11) {
      setChartMonth(0);
      setChartYear(prev => prev + 1);
    } else {
      setChartMonth(prev => prev + 1);
    }
    setCurrentWeek(0); // Reset to first week when changing month
  };

  const handlePreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(prev => prev - 1);
    }
  };

  const handleNextWeek = () => {
    const totalWeeks = getTotalWeeks();
    if (currentWeek < totalWeeks - 1) {
      setCurrentWeek(prev => prev + 1);
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text("Earnings Report", 14, 20);
      
      // Add date range
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, 28);
      
      // Add summary stats
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text("Summary", 14, 38);
      
      doc.setFontSize(10);
      doc.text(`Total Earnings: Rs. ${stats.totalEarnings.toLocaleString('en-IN')}`, 14, 46);
      doc.text(`This Month: Rs. ${stats.thisMonth.toLocaleString('en-IN')}`, 14, 52);
      doc.text(`Paid Amount: Rs. ${stats.paidAmount.toLocaleString('en-IN')}`, 14, 58);
      doc.text(`Pending Earnings: Rs. ${stats.pendingEarnings.toLocaleString('en-IN')}`, 14, 64);
      
      // Prepare table data
      const tableData = revenues.map(revenue => [
        revenue.booking?._id?.slice(-8).toUpperCase() || 'N/A',
        revenue.hallName,
        formatDate(revenue.date),
        `Rs. ${revenue.hallOwnerCommission?.toLocaleString('en-IN')}`,
        getStatusBadge(revenue.status).label
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        startY: 72,
        head: [['Booking ID', 'Hall Name', 'Event Date', 'Amount', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [55, 65, 81]
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 72, left: 14, right: 14 },
        styles: {
          font: 'helvetica',
          fontStyle: 'normal'
        }
      });
      
      // Save the PDF
      doc.save(`earnings-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  const downloadExcel = () => {
    try {
      // Prepare summary data
      const summaryData = [
        ['Earnings Report'],
        ['Generated on:', new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
        [],
        ['Summary'],
        ['Total Earnings', `₹${stats.totalEarnings.toLocaleString('en-IN')}`],
        ['This Month', `₹${stats.thisMonth.toLocaleString('en-IN')}`],
        ['Paid Amount', `₹${stats.paidAmount.toLocaleString('en-IN')}`],
        ['Pending Earnings', `₹${stats.pendingEarnings.toLocaleString('en-IN')}`],
        [],
        ['Detailed Report']
      ];
      
      // Prepare table headers
      const headers = [['Booking ID', 'Hall Name', 'Event Date', 'Amount', 'Status']];
      
      // Prepare table data
      const tableData = revenues.map(revenue => [
        revenue.booking?._id?.slice(-8).toUpperCase() || 'N/A',
        revenue.hallName,
        formatDate(revenue.date),
        revenue.hallOwnerCommission || 0,
        getStatusBadge(revenue.status).label
      ]);
      
      // Combine all data
      const worksheetData = [...summaryData, ...headers, ...tableData];
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 }
      ];
      
      // Style the title row
      if (worksheet['A1']) {
        worksheet['A1'].s = {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'left' }
        };
      }
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Earnings Report');
      
      // Save the file
      XLSX.writeFile(workbook, `earnings-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Excel file");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': { label: 'Paid', class: 'status-paid' },
      'pending': { label: 'Pending', class: 'status-pending' },
      'refunded': { label: 'Refunded', class: 'status-refunded' },
      'cancelled': { label: 'Refund', class: 'status-refund' }
    };
    return statusMap[status] || { label: status, class: 'status-pending' };
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = revenues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(revenues.length / itemsPerPage);

  const monthlyData = chartViewMode === "yearly" 
    ? getMonthlyData() 
    : chartViewMode === "monthly" 
    ? getWeeklyDataForMonth()
    : getWeeklyPaginatedData();
  const maxValue = Math.max(...monthlyData, 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const availableYears = getAvailableYears();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const isCurrentYear = chartYear === currentYear;
  const isCurrentMonth = chartYear === currentYear && chartMonth === currentMonth;
  const canGoNextMonth = !(chartYear === currentYear && chartMonth === currentMonth);
  const totalWeeks = getTotalWeeks();
  const startDayOfWeek = currentWeek * 7 + 1;

  if (loading) return <Loader />;

  return (
    <div className="earnings-report-page">
      <div className="earnings-header">
        <div>
          <h1>Earnings Report</h1>
          <div className="breadcrumb">
            <Link to="/hall-owner/dashboard">Home</Link>
            <span>›</span>
            <span style={{'color':'white'}}>Earnings Report</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="earnings-stats-grid">
        <div className="earnings-stat-card total">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">₹{stats.totalEarnings.toLocaleString('en-IN')}</p>
            <div className="stat-details">
              <span>Paid Amount: ₹{stats.paidAmount.toLocaleString('en-IN')}</span>
              <span>Pending Amount: ₹{stats.pendingEarnings.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="earnings-stat-card month">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>This Month</h3>
            <p className="stat-value">₹{stats.thisMonth.toLocaleString('en-IN')}</p>
            <div className="stat-growth">
              {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}% vs last month
            </div>
          </div>
        </div>

        <div className="earnings-stat-card paid">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Paid Amount</h3>
            <p className="stat-value">₹{stats.paidAmount.toLocaleString('en-IN')}</p>
            <div className="stat-subtitle">Omnides since 2024</div>
          </div>
        </div>

        <div className="earnings-stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Earnings</h3>
            <p className="stat-value">₹{stats.pendingEarnings.toLocaleString('en-IN')}</p>
            <div className="stat-subtitle">On Cancels</div>
          </div>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="earnings-overview-section">
        <div className="overview-header">
          <h2>Earnings Overview</h2>
          <div className="overview-controls">
            <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
              <option value="yearly">This Year</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="date-range-display">
              {dateRange.startDate} - {dateRange.endDate}
            </div>
          </div>
        </div>

        <div className="overview-content">
          <div className="download-buttons">
            <button onClick={downloadPDF} className="btn-download pdf">
              📄 Download PDF
            </button>
            <button onClick={downloadExcel} className="btn-download excel">
              📊 Download Excel
            </button>
          </div>

          <div className="earnings-chart-table">
            {/* Table */}
            <div className="earnings-table-section">
              <h3>Earnings Report</h3>
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>BOOKING ID</th>
                    <th>HALL NAME</th>
                    <th>EVENT DATE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((revenue) => {
                    const statusInfo = getStatusBadge(revenue.status);
                    return (
                      <tr key={revenue._id}>
                        <td>{revenue.booking?._id?.slice(-8).toUpperCase() || 'N/A'}</td>
                        <td>{revenue.hallName}</td>
                        <td>{formatDate(revenue.date)}</td>
                        <td>₹{revenue.hallOwnerCommission?.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="pagination-buttons">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    title="Previous Page"
                  >
                    ‹
                  </button>
                  
                  {/* First page */}
                  {currentPage > 2 && (
                    <>
                      <button onClick={() => setCurrentPage(1)}>1</button>
                      {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
                    </>
                  )}
                  
                  {/* Current page and neighbors */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show current page and one page before/after
                    if (pageNum >= currentPage - 1 && pageNum <= currentPage + 1) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? 'active' : ''}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
                      <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    title="Next Page"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="earnings-chart-section">
              <div className="chart-header">
                <span className="chart-value">₹{stats.thisMonth.toLocaleString('en-IN')}</span>
                <div className="chart-view-toggle">
                  <button 
                    className={`view-toggle-btn ${chartViewMode === 'yearly' ? 'active' : ''}`}
                    onClick={() => setChartViewMode('yearly')}
                  >
                    Year
                  </button>
                  <button 
                    className={`view-toggle-btn ${chartViewMode === 'monthly' ? 'active' : ''}`}
                    onClick={() => setChartViewMode('monthly')}
                  >
                    Month
                  </button>
                  <button 
                    className={`view-toggle-btn ${chartViewMode === 'daily' ? 'active' : ''}`}
                    onClick={() => setChartViewMode('daily')}
                  >
                    Day
                  </button>
                </div>
              </div>
              
              <div className="bar-chart-container">
                <div className="chart-y-axis">
                  <span className="y-axis-label">₹{Math.round(maxValue / 1000)}k</span>
                  <span className="y-axis-label">₹{Math.round((maxValue * 0.75) / 1000)}k</span>
                  <span className="y-axis-label">₹{Math.round((maxValue * 0.5) / 1000)}k</span>
                  <span className="y-axis-label">₹{Math.round((maxValue * 0.25) / 1000)}k</span>
                  <span className="y-axis-label">₹0</span>
                </div>
                
                <div className="chart-content">
                  <div className="bar-chart">
                    {monthlyData.map((value, index) => {
                      const isHighlighted = chartViewMode === "yearly" 
                        ? (index === new Date().getMonth() && isCurrentYear)
                        : false;
                      const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      
                      let label;
                      let actualDayIndex;
                      if (chartViewMode === "yearly") {
                        label = `${months[index]} ${chartYear}`;
                      } else if (chartViewMode === "monthly") {
                        label = `Week ${index + 1}`;
                      } else {
                        actualDayIndex = startDayOfWeek + index;
                        const date = new Date(chartYear, chartMonth, actualDayIndex);
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const dayOfWeek = dayNames[date.getDay()];
                        label = `${dayOfWeek}, Day ${actualDayIndex}`;
                      }
                      
                      return (
                        <div key={index} className="bar-container">
                          <div 
                            className={`bar ${isHighlighted ? 'current-month' : ''}`}
                            style={{ 
                              height: `${Math.max(percentage, 5)}%`
                            }}
                            title={`${label}: ₹${value.toLocaleString('en-IN')}`}
                          >
                            {value > 0 && percentage > 15 && (
                              <span className="bar-value">
                                ₹{value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {chartViewMode === "daily" && (
                    <div className="x-axis-day-labels">
                      {monthlyData.map((_, index) => {
                        const actualDayIndex = startDayOfWeek + index;
                        const date = new Date(chartYear, chartMonth, actualDayIndex);
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const dayOfWeek = dayNames[date.getDay()];
                        return (
                          <span key={index} className="x-axis-day-label">{dayOfWeek}</span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Navigation */}
              <div className="chart-navigation">
                {chartViewMode === "yearly" ? (
                  <div className="year-navigation">
                    <button 
                      onClick={handlePreviousYear}
                      className="nav-btn"
                      title="Previous Year"
                    >
                      ‹
                    </button>
                    <span className="nav-label">{chartYear}</span>
                    <button 
                      onClick={handleNextYear}
                      className="nav-btn"
                      disabled={isCurrentYear}
                      title="Next Year"
                    >
                      ›
                    </button>
                  </div>
                ) : chartViewMode === "monthly" ? (
                  <div className="month-navigation">
                    <button 
                      onClick={handlePreviousMonth}
                      className="nav-btn"
                      title="Previous Month"
                    >
                      ‹
                    </button>
                    <span className="nav-label">{monthNames[chartMonth]} {chartYear}</span>
                    <button 
                      onClick={handleNextMonth}
                      className="nav-btn"
                      disabled={!canGoNextMonth}
                      title="Next Month"
                    >
                      ›
                    </button>
                  </div>
                ) : (
                  <div className="week-navigation">
                    <button 
                      onClick={handlePreviousWeek}
                      className="nav-btn"
                      disabled={currentWeek === 0}
                      title="Previous Week"
                    >
                      ‹
                    </button>
                    <span className="nav-label">
                      Week {currentWeek + 1} of {totalWeeks} - {monthNames[chartMonth]} {chartYear}
                    </span>
                    <button 
                      onClick={handleNextWeek}
                      className="nav-btn"
                      disabled={currentWeek >= totalWeeks - 1}
                      title="Next Week"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{ background: 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 100%)' }}></span>
                  {chartViewMode === "yearly" 
                    ? chartYear 
                    : chartViewMode === "monthly"
                    ? `${monthNames[chartMonth]} ${chartYear} (Weekly)`
                    : `${monthNames[chartMonth]} ${chartYear} (Daily)`}
                </span>
                {isCurrentYear && chartViewMode === "yearly" && (
                  <span className="legend-item">
                    <span className="legend-color" style={{ background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' }}></span>
                    Current Month
                  </span>
                )}
              </div>

              <div className="chart-stats">
                <div className="chart-stat-item">
                  <span className="chart-stat-label">Highest</span>
                  <span className="chart-stat-value">₹{Math.max(...monthlyData).toLocaleString('en-IN')}</span>
                </div>
                <div className="chart-stat-item">
                  <span className="chart-stat-label">Average</span>
                  <span className="chart-stat-value">
                    ₹{Math.round(monthlyData.reduce((a, b) => a + b, 0) / 12).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="chart-stat-item">
                  <span className="chart-stat-label">Total</span>
                  <span className="chart-stat-value">₹{stats.totalEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsReport;
