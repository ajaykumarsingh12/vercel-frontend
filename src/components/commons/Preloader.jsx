import { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after page loads
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="preloader">
      <div className="preloader-content">
        {/* Simple White Loader */}
        <div className="loader-spinner"></div>
        
        {/* Loading Text */}
        <div className="preloader-text">
          {/* <h2>BookMyHall</h2> */}
          <p>Loading<span className="dots"></span></p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
