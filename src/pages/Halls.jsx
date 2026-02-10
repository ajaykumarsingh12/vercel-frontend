import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Loader from "../components/commons/Loader";
import { useAuth } from "../context/AuthContext";
import HallCard from "../components/commons/HallCard";
import "./Halls.css";

const Halls = () => {
  const { user, toggleFavorite, isAuthenticated } = useAuth();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    priceRange: [0, 200000], // Min and max price for slider
    minimumGuests: "",
    amenities: {
      airConditioning: false,
      parkingAvailable: false,
      cateringIncluded: false,
    },
  });
  const [appliedFilters, setAppliedFilters] = useState({
    city: "",
    state: "",
    priceRange: [0, 200000],
    minimumGuests: "",
    amenities: {
      airConditioning: false,
      parkingAvailable: false,
      cateringIncluded: false,
    },
  });

  useEffect(() => {
    fetchHalls();
  }, [appliedFilters]);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(appliedFilters).forEach((key) => {
        if (appliedFilters[key]) params.append(key, appliedFilters[key]);
      });

      const response = await axios.get(`/api/halls?${params.toString()}`);
      setHalls(response.data);
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFilters({
        ...filters,
        amenities: {
          ...filters.amenities,
          [name]: checked,
        },
      });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const handlePriceRangeChange = (newRange) => {
    setFilters({
      ...filters,
      priceRange: newRange,
    });
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const emptyFilters = {
      city: "",
      state: "",
      priceRange: [0, 200000],
      minimumGuests: "",
      amenities: {
        airConditioning: false,
        parkingAvailable: false,
        cateringIncluded: false,
      },
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  /* ... existing state ... */
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ... existing logic ... */

  const hasActiveFilters = Object.values(appliedFilters).some(
    (value) => value !== "",
  );

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const getSortedHalls = () => {
    const sorted = [...halls];
    if (sortBy === "priceLow")
      return sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortBy === "priceHigh")
      return sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
    if (sortBy === "capacity")
      return sorted.sort((a, b) => b.capacity - a.capacity);
    return sorted;
  };

  const sortedHalls = getSortedHalls();

  // Categorize halls by price
  const categorizeHallsByPrice = (halls) => {
    const budget = halls.filter(hall => hall.pricePerHour < 5000);
    const midRange = halls.filter(hall => hall.pricePerHour >= 5000 && hall.pricePerHour < 15000);
    const premium = halls.filter(hall => hall.pricePerHour >= 15000);

    return { budget, midRange, premium };
  };

  const { budget, midRange, premium } = categorizeHallsByPrice(sortedHalls);

  // Carousel navigation
  const scrollCarousel = (categoryId, direction) => {
    const container = document.getElementById(categoryId);
    if (!container) return;

    const scrollAmount = 370; // Card width + gap
    const newScrollPosition = direction === 'next' 
      ? container.scrollLeft + scrollAmount 
      : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  };

  // Render grid for each category
  const renderGrid = (halls, categoryTitle, categoryDescription) => {
    if (halls.length === 0) return null;

    return (
      <div className="category-section" key={categoryTitle}>
        <div className="category-header">
          <h3 className="category-title">{categoryTitle}</h3>
          <p className="category-description">{categoryDescription}</p>
        </div>

        <div className="halls-grid">
          {halls.map((hall) => (
            <HallCard key={hall._id} hall={hall} showShare={true} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="halls-page">
      <div className="halls-header">
        <h1>Browse Wedding Halls</h1>
        <p>
          Find and book the perfect venue for your special occasion from our
          curated collection
        </p>
        <button
          className="mobile-filter-toggle-btn"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className={`filters-section ${showMobileFilters ? "show" : ""}`}>
        <div className="filters-header">
          <div className="filters-title">
            <h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filter Venues
            </h2>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-clear">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Clear All
            </button>
          )}
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Where</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={filters.city}
                onChange={handleFilterChange}
                autoComplete="address-level2"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={filters.state}
                onChange={handleFilterChange}
                autoComplete="address-level1"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Budget (₹/hr)</label>
            <div className="input-wrapper">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleFilterChange}
                min="0"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Guests</label>
            <input
              type="number"
              name="capacity"
              placeholder="Min Capacity"
              value={filters.capacity}
              onChange={handleFilterChange}
              min="1"
            />
          </div>

          <button onClick={applyFilters} className="btn-apply">
            Search Halls
          </button>
        </div>
      </div>

      <div className="results-container">
        <div className="results-info">
          <p className="results-count">
            {halls.length} {halls.length === 1 ? "venue available" : "venues available"}
          </p>

          <div className="sort-container">
            <label>Sort by:</label>
            <div className={`recommended-dropdown ${showDropdown ? 'open' : ''}`} ref={dropdownRef}>
              <button
                className="recommended-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>
                  {sortBy === "recommended" && "Recommended"}
                  {sortBy === "priceLow" && "Price: Low to High"}
                  {sortBy === "priceHigh" && "Price: High to Low"}
                  {sortBy === "capacity" && "Largest Capacity"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${sortBy === "recommended" ? "active" : ""}`}
                  onClick={() => { setSortBy("recommended"); setShowDropdown(false); }}
                >
                  Recommended
                </button>
                <button
                  className={`dropdown-item ${sortBy === "priceLow" ? "active" : ""}`}
                  onClick={() => { setSortBy("priceLow"); setShowDropdown(false); }}
                >
                  Price: Low to High
                </button>
                <button
                  className={`dropdown-item ${sortBy === "priceHigh" ? "active" : ""}`}
                  onClick={() => { setSortBy("priceHigh"); setShowDropdown(false); }}
                >
                  Price: High to Low
                </button>
                <button
                  className={`dropdown-item ${sortBy === "capacity" ? "active" : ""}`}
                  onClick={() => { setSortBy("capacity"); setShowDropdown(false); }}
                >
                  Largest Capacity
                </button>
              </div>
            </div>
          </div>
        </div>

        {halls.length === 0 ? (
          <div className="no-results">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="no-results-icon"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3>No venues found</h3>
            <p>We couldn't find any halls matching your current filters.</p>
          </div>
        ) : (
          <div className="categorized-halls">
            {/* Budget Category */}
            {budget.length > 0 && (
              <div className="category-section">
                <div className="category-header">
                  <div className="category-title-wrapper">
                    <h3 className="category-title">Budget Friendly</h3>
                    <span className="category-badge">Under ₹5,000/hr</span>
                  </div>
                  <p className="category-description">
                    Affordable venues perfect for intimate gatherings and budget-conscious events
                  </p>
                </div>
                <button 
                  className="carousel-nav-btn carousel-nav-btn--prev"
                  onClick={() => scrollCarousel('budget-carousel', 'prev')}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="halls-grid" id="budget-carousel">
                  {budget.map((hall) => (
                    <HallCard key={hall._id} hall={hall} showShare={true} />
                  ))}
                </div>
                <button 
                  className="carousel-nav-btn carousel-nav-btn--next"
                  onClick={() => scrollCarousel('budget-carousel', 'next')}
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mid-Range Category */}
            {midRange.length > 0 && (
              <div className="category-section">
                <div className="category-header">
                  <div className="category-title-wrapper">
                    <h3 className="category-title">Mid-Range</h3>
                    <span className="category-badge">₹5,000 - ₹15,000/hr</span>
                  </div>
                  <p className="category-description">
                    Well-equipped venues offering great value with modern amenities
                  </p>
                </div>
                <button 
                  className="carousel-nav-btn carousel-nav-btn--prev"
                  onClick={() => scrollCarousel('midrange-carousel', 'prev')}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="halls-grid" id="midrange-carousel">
                  {midRange.map((hall) => (
                    <HallCard key={hall._id} hall={hall} showShare={true} />
                  ))}
                </div>
                <button 
                  className="carousel-nav-btn carousel-nav-btn--next"
                  onClick={() => scrollCarousel('midrange-carousel', 'next')}
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Premium Category */}
            {premium.length > 0 && (
              <div className="category-section">
                <div className="category-header">
                  <div className="category-title-wrapper">
                    <h3 className="category-title">Premium</h3>
                    <span className="category-badge">₹15,000+/hr</span>
                  </div>
                  <p className="category-description">
                    Luxurious venues with premium facilities for grand celebrations
                  </p>
                </div>
                <button 
                  className="carousel-nav-btn carousel-nav-btn--prev"
                  onClick={() => scrollCarousel('premium-carousel', 'prev')}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="halls-grid" id="premium-carousel">
                  {premium.map((hall) => (
                    <HallCard key={hall._id} hall={hall} showShare={true} />
                  ))}
                </div>
                <button 
                  className="carousel-nav-btn carousel-nav-btn--next"
                  onClick={() => scrollCarousel('premium-carousel', 'next')}
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Halls;
