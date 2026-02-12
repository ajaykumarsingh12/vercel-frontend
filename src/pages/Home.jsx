import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "../components/commons/HeroSection";
import HallCard from "../components/commons/HallCard";
import HallCardSkeleton from "../components/commons/HallCardSkeleton";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { user, toggleFavorite, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [featuredHalls, setFeaturedHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const featuresRef = useRef(null);
  const cardsSectionRef = useRef(null);

  useEffect(() => {
    fetchFeaturedHalls();
  }, []);

  useEffect(() => {
    // console.log('State Update:', {
    //   loading,
    //   featuredHallsCount: featuredHalls.length,
    //   featuredHalls: featuredHalls
    // });
  }, [loading, featuredHalls]);

  const fetchFeaturedHalls = async () => {
    try {
     // console.log('🔍 Fetching halls from:', axios.defaults.baseURL + '/api/halls?limit=6');
      const response = await axios.get("/api/halls?limit=6");
      
      // Ensure response.data is an array
      const hallsData = Array.isArray(response.data) ? response.data : [];

      
      if (hallsData.length === 0) {
        console.warn('⚠️ No halls returned from API');
      } else {
      }
      
      setFeaturedHalls(hallsData.slice(0, 6));
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ Error Response:', error.response);
      console.error('❌ Error Message:', error.message);
      toast.error("Failed to load featured halls: " + (error.response?.data?.message || error.message));
      setFeaturedHalls([]); // Set empty array on error
    } finally {
      //console.log('✅ Setting loading to false');
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What is BookMyHall.com?",
      answer: "BookMyHall.com is a comprehensive online platform that connects event organizers with the perfect wedding halls and event venues. We provide a seamless booking experience, allowing you to browse, compare, and book venues for your special occasions."
    },
    {
      question: "How can I check the venue contact number?",
      answer: "Once you select a hall from our listings, you'll find the venue's contact information on the hall detail page. This includes the owner's name and phone number, allowing you to directly communicate with the venue owner for any specific queries."
    },
    {
      question: "How can I check the venue availability for my event date?",
      answer: "On each hall's detail page, you'll find a booking calendar where you can select your desired event date. The system will automatically show you the available time slots for that date. If a time slot is already booked, you'll see a notification indicating when the venue will be available next."
    }
  ];

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= rating ? "filled" : ""}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.15,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="home">
      <HeroSection />

      {/* Featured Halls Section */}
      <div className="featured-halls-section" ref={cardsSectionRef}>
        <div className="container">
          <div className="section-header">
            <h2>Featured Wedding Halls</h2>
            <p>
              Discover the most popular and highly-rated venues in your area
            </p>
          </div>

          {/* View All Halls Button - Above Cards */}
          <div className="view-all-halls-container">
            <Link to="/halls" className="view-all-halls-primary-btn">
              <span>View All Halls</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="halls-grid-container">
              <div className="halls-grid">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="hall-grid-item">
                    <HallCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          ) : featuredHalls.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              background: theme === 'dark' ? 'var(--card-bg)' : 'white',
              borderRadius: '16px',
              boxShadow: theme === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              margin: '2rem 0',
              border: theme === 'dark' ? '1px solid var(--border-color)' : 'none'
            }}>
              <p style={{ 
                color: theme === 'dark' ? 'var(--text-secondary)' : '#666', 
                marginBottom: '1.5rem',
                fontSize: '1.1rem',
                lineHeight: '1.6'
              }}>
                No halls available at the moment.<br />
                Please check back later or contact support.
              </p>
            </div>
          ) : (
            <div className="halls-grid-container">
              <div className="halls-grid">
                {featuredHalls.slice(0, 6).map((hall) => (
                  <div key={hall._id} className="hall-grid-item">
                    <HallCard hall={hall} renderStars={renderStars} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer FAQ Section */}
      <div className="faq-section">
        <div className="container">
          <div className="faq-header">
            <h2>Customer FAQ</h2>
          </div>

          <div className="faq-container">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaqIndex === index ? 'active' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <svg
                    className="faq-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M19 9L12 16L5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="features-section" ref={featuresRef}>
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose BookMyHall?
          </motion.h2>

          <motion.div
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Wide Selection",
                description: "Browse through hundreds of venues in your city",
                icon: (
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    <rect x="10" y="20" width="80" height="60" rx="8" fill="#E3F2FD" stroke="#2196F3" strokeWidth="2" />
                    <circle cx="25" cy="35" r="8" fill="#F44336" />
                    <circle cx="35" cy="50" r="6" fill="#F44336" />
                    <circle cx="15" cy="55" r="4" fill="#F44336" />
                    <circle cx="45" cy="40" r="12" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2" />
                    <path d="M40 40L43 43L50 36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              },
              {
                title: "Easy Booking",
                description: "Book your preferred hall in just a few clicks",
                icon: (
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    <rect x="25" y="15" width="50" height="70" rx="8" fill="#E3F2FD" stroke="#2196F3" strokeWidth="2" />
                    <rect x="30" y="25" width="40" height="25" rx="4" fill="#4CAF50" />
                    <circle cx="35" cy="32" r="2" fill="white" />
                    <circle cx="42" cy="32" r="2" fill="white" />
                    <circle cx="49" cy="32" r="2" fill="white" />
                    <rect x="32" y="38" width="12" height="8" rx="2" fill="white" />
                    <rect x="46" y="38" width="12" height="8" rx="2" fill="white" />
                    <circle cx="70" cy="30" r="15" fill="#FFC107" stroke="#FF8F00" strokeWidth="2" />
                    <path d="M65 30L68 33L75 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              },
              {
                title: "Verified Venues",
                description: "All halls are verified and approved by our team",
                icon: (
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="35" fill="#FFC107" stroke="#FF8F00" strokeWidth="3" />
                    <circle cx="50" cy="50" r="25" fill="#4CAF50" />
                    <path d="M42 50L47 55L58 44" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M35 25L40 20L45 25" fill="#FFC107" />
                    <path d="M55 25L60 20L65 25" fill="#FFC107" />
                    <path d="M70 40L75 35L70 30" fill="#FFC107" />
                    <path d="M30 40L25 35L30 30" fill="#FFC107" />
                  </svg>
                )
              },
              {
                title: "Best Prices",
                description: "Compare prices and find the best deals",
                icon: (
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    <rect x="15" y="35" width="70" height="45" rx="8" fill="#E3F2FD" stroke="#2196F3" strokeWidth="2" />
                    <rect x="20" y="40" width="60" height="8" rx="4" fill="#4CAF50" />
                    <text x="50" y="60" textAnchor="middle" fill="#2196F3" fontSize="12" fontWeight="bold">DEAL</text>
                    <circle cx="70" cy="25" r="12" fill="#FFC107" />
                    <text x="70" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">$</text>
                    <rect x="55" y="15" width="25" height="15" rx="4" fill="#FF9800" stroke="#F57C00" strokeWidth="1" />
                    <circle cx="25" cy="25" r="8" fill="#4CAF50" />
                    <path d="M22 25L24 27L28 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0px 10px 30px rgba(102, 126, 234, 0.4), 0px 5px 15px rgba(118, 75, 162, 0.3), 0px 2px 8px rgba(0,0,0,0.1)",
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
