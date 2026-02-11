import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "./HallCard.css";

const HallCard = ({ hall, cardAnimation, renderStars, showShare = false }) => {
  const { user, toggleFavorite, isAuthenticated, favorites } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const images =
    hall.images && hall.images.length > 0
      ? hall.images.map((img) =>
        img.startsWith("http")
          ? img
          : `http://localhost:5000/${img}`
      )
      : [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop&crop=center",
      ];

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = (e, platform) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/halls/${hall._id}`;
    const title = `Check out ${hall.name}`;
    const text = `${hall.name} - ${hall.location?.city}, ${hall.location?.state}. Capacity: ${hall.capacity} people. Price: ₹${hall.pricePerHour}/hr`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          toast.success('Link copied to clipboard!');
          setShowShareMenu(false);
        });
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      className="browse-hall-card"
      data-name={hall.name}
      style={cardAnimation}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 1,
      }}
    >
      <div className="browse-hall-card__image-container">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={hall.name}
            className="browse-hall-card__image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -50) {
                nextImage(e);
              } else if (swipe > 50) {
                prevImage(e);
              }
            }}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop&crop=center";
            }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              className="browse-hall-card__carousel-control browse-hall-card__carousel-control--prev"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M100,15a85,85,0,1,0,85,85A84.93,84.93,0,0,0,100,15Zm0,150a65,65,0,1,1,65-65A64.87,64.87,0,0,1,100,165ZM116.5,57.5a9.67,9.67,0,0,0-14,0L74,86a19.92,19.92,0,0,0,0,28.5L102.5,143a9.9,9.9,0,0,0,14-14l-28-29L117,71.5C120.5,68,120.5,61.5,116.5,57.5Z" />
              </svg>
            </button>
            <button
              className="browse-hall-card__carousel-control browse-hall-card__carousel-control--next"
              onClick={nextImage}
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
                <path d="M100,15a85,85,0,1,0,85,85A84.93,84.93,0,0,0,100,15Zm0,150a65,65,0,1,1,65-65A64.87,64.87,0,0,1,100,165ZM116.5,57.5a9.67,9.67,0,0,0-14,0L74,86a19.92,19.92,0,0,0,0,28.5L102.5,143a9.9,9.9,0,0,0,14-14l-28-29L117,71.5C120.5,68,120.5,61.5,116.5,57.5Z" />
              </svg>
            </button>
            <div className="browse-hall-card__carousel-indicators">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`browse-hall-card__indicator-dot ${index === currentImageIndex ? "browse-hall-card__indicator-dot--active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
            <div className="browse-hall-card__photo-count-badge">
              <span className="current">{currentImageIndex + 1}</span>
              <span className="divider">/</span>
              <span className="total">{images.length}</span>
            </div>
          </>
        )}

        <div className="browse-hall-card__overlay">
          <Link to={`/halls/${hall._id}`} className="browse-hall-card__view-details-btn">
            View Details
          </Link>
        </div>

        <button
          className={`browse-hall-card__favorite-btn ${favorites?.includes(hall._id) ? "browse-hall-card__favorite-btn--active" : ""} ${isAnimating ? "animating" : ""}`}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) {
              toast.info("Please login to add favorites");
              return;
            }
            if (user.role !== "user") {
              toast.info("Only users can add favorites");
              return;
            }
            
            // Trigger animation
            setIsAnimating(true);
            
            // Show big heart animation only when liking (not unliking)
            if (!favorites?.includes(hall._id)) {
              setShowBigHeart(true);
              setTimeout(() => setShowBigHeart(false), 1000);
            }
            
            // Call toggle favorite
            await toggleFavorite(hall._id);
            
            // Remove animation class after animation completes
            setTimeout(() => {
              setIsAnimating(false);
            }, 600);
          }}
          title={favorites?.includes(hall._id) ? "Remove from Favorites" : "Add to Favorites"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={favorites?.includes(hall._id) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Big Heart Animation (Instagram-style) */}
        {showBigHeart && (
          <div className="browse-hall-card__big-heart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="120"
              height="120"
              viewBox="0 0 100 100"
              fill="white"
            >
              <path 
                d="M50,85 C50,85 15,60 15,40 C15,30 20,25 27.5,25 C35,25 40,30 50,40 C60,30 65,25 72.5,25 C80,25 85,30 85,40 C85,60 50,85 50,85 Z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Share Button - Only show on browse page */}
        {showShare && (
          <div className="browse-hall-card__share-btn-container">
            <button
              className={`browse-hall-card__share-btn ${showShareMenu ? 'browse-hall-card__share-btn--active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              title="Share this hall"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
            </button>

            {showShareMenu && (
              <div className="browse-hall-card__share-radial-menu" onClick={(e) => e.stopPropagation()}>
                <button
                  className="browse-hall-card__share-radial-option browse-hall-card__share-radial-option--facebook"
                  onClick={(e) => handleShare(e, 'facebook')}
                  title="Share on Facebook"
                  style={{ '--index': 0 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  className="browse-hall-card__share-radial-option browse-hall-card__share-radial-option--whatsapp"
                  onClick={(e) => handleShare(e, 'whatsapp')}
                  title="Share on WhatsApp"
                  style={{ '--index': 1 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </button>
                <button
                  className="browse-hall-card__share-radial-option browse-hall-card__share-radial-option--copy"
                  onClick={(e) => handleShare(e, 'copy')}
                  title="Copy Link"
                  style={{ '--index': 2 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="browse-hall-card__info">
        <h3 className="browse-hall-card__name">{hall.name}</h3>
        <div className="browse-hall-card__location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>
            {hall.location?.city}, {hall.location?.state}
          </span>
        </div>
        <div className="browse-hall-card__stats">
          <div className="browse-hall-card__stat-item browse-hall-card__stat-item--capacity">
            <div className="browse-hall-card__stat-content">
              <span className="browse-hall-card__stat-label">CAPACITY:</span>
              <span className="browse-hall-card__stat-value">{hall.capacity} people</span>
            </div>
          </div>
          <div className="browse-hall-card__stat-item browse-hall-card__stat-item--price">
            <div className="browse-hall-card__stat-content">
              <span className="browse-hall-card__stat-label">PRICE:</span>
              <span className="browse-hall-card__stat-value">₹{hall.pricePerHour}/hr</span>
            </div>
          </div>
        </div>
        <Link to={`/halls/${hall._id}`} className="browse-hall-card__btn-primary">
          VIEW DETAIL
        </Link>
      </div>
    </motion.div>
  );
};

export default HallCard;
