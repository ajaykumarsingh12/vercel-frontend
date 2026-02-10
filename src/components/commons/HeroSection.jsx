import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import "./HeroSection.css";
/*
const heroImages = [
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&q=80",
  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1920&q=80"
];
*/
const heroVideos = [
  {
    src: "https://res.cloudinary.com/dmr0vnlww/video/upload/v1770547810/hall-booking/videos/hero-video.mp4",
  }
];

const HeroSection = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const titleRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(true); // Start with video by default
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Split text into characters for animation
  const splitText = (text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="char" style={{ '--char-index': index }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  // Split text into lines for subtitle animation
  const splitLines = (text) => {
    const sentences = text.split('. ');
    return sentences.map((sentence, index) => (
      <span key={index} className="subtitle-line" style={{ '--line-index': index }}>
        {sentence}{index < sentences.length - 1 ? '.' : ''}
      </span>
    ));
  };

  // GSAP Animation for split text
  useEffect(() => {
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.char');

      gsap.fromTo(
        chars,
        {
          opacity: 0,
          y: 100,
          rotationX: -90,
          transformOrigin: '50% 50% -50px',
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          ease: 'back.out(1.7)',
          stagger: {
            amount: 0.8,
            from: 'start',
          },
          delay: 0.3,
        }
      );
    }

    // Animate subtitle lines
    const subtitleLines = document.querySelectorAll('.subtitle-line');
    if (subtitleLines.length > 0) {
      gsap.fromTo(
        subtitleLines,
        {
          opacity: 0,
          y: 30,
          rotationX: -45,
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.3,
          delay: 1.5,
        }
      );
    }
  }, []);

  useEffect(() => {
    // Auto-play video when component mounts
    if (showVideo && videoRef.current) {
      setTimeout(() => {
        videoRef.current.play().catch((error) => {
          // Video autoplay failed
          // Fallback to images if autoplay fails
          setShowVideo(false);
        });
      }, 500);
    }
  }, [showVideo, currentVideoIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!showVideo) {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, [showVideo]);

  // Video event handlers
  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const handleVideoEnd = () => {
    // Auto switch to next video or loop
    const nextVideoIndex = (currentVideoIndex + 1) % heroVideos.length;
    setCurrentVideoIndex(nextVideoIndex);
  };

  const handleVideoError = (e) => {
    // Video failed to load
    // Fallback to images if video fails
    setShowVideo(false);
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  // Transform scroll progress to animation values
  const leftButtonX = useTransform(scrollYProgress, [0, 0.7], [-150, 0]);
  const rightButtonX = useTransform(scrollYProgress, [0, 0.7], [150, 0]);
  const buttonsOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 1]);
  const buttonsScale = useTransform(scrollYProgress, [0, 0.5], [1, 1]);

  // Add rotation for more dramatic effect on right button
  const rightButtonRotate = useTransform(scrollYProgress, [0, 0.7], [0, 0]);

  return (
    <section ref={heroRef} className="hero-section">
      <div className="hero-background">
        {/* Video Background */}
        {showVideo && (
          <div className="hero-video-container">
            <video
              ref={videoRef}
              className="hero-video"
              poster={heroVideos[currentVideoIndex].poster}
              onLoadedData={handleVideoLoad}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnd}
              onError={handleVideoError}
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroVideos[currentVideoIndex].src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls - REMOVED */}
          </div>
        )}

        {/* Image Background */}
        {!showVideo && (
          <>
            <AnimatePresence>
              <motion.img
                key={currentImageIndex}
                src={heroImages[currentImageIndex]}
                alt={`Elegant ballroom venue ${currentImageIndex + 1}`}
                className="hero-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Image Slider Dots */}
            <div className="hero-slider-dots">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </>
        )}

        {/* Video Toggle Button - REMOVED */}

        <div
          className="hero-bg-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: showVideo ? "rgba(2, 2, 2, 0.3)" : "rgba(2, 2, 2, 0.65)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        ></div>
      </div>
      <div className="hero-content">
        <div className="hero-text-container">
          <div className="hero-title-wrapper">
            <div className="hero-title-decoration">
              <div className="decoration-line decoration-left"></div>
              <div className="decoration-sparkle">💫</div>
              <div className="decoration-line decoration-right"></div>
            </div>
            <h1 className="hero-title" ref={titleRef}>
              <span className="title-line">
                {splitText('Find Your Perfect')}
              </span>
              <span className="title-line">
                {splitText('Wedding Venue')}
              </span>
            </h1>


          </div>

          <div className="hero-subtitle-wrapper">
            <p className="hero-subtitle" style={{ fontSize: '16px' }}>
              {splitLines('Discover the most exquisite wedding halls and venues for your special day. From grand ballrooms to intimate garden settings, find your dream wedding venue today.')}
            </p>
          </div>
        </div>

        <div className="hero-buttons">
          <motion.div
            style={{
              x: leftButtonX,
              opacity: buttonsOpacity,
              scale: buttonsScale,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 22,
              duration: 1.3,
            }}
          >
            <Link to="/halls" className="btn btn-primary hero-btn-main">
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
                className="btn-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span className="btn-text">Browse Halls</span>
              <div className="btn-glow"></div>
            </Link>
          </motion.div>

          <motion.div
            style={{
              x: rightButtonX,
              opacity: buttonsOpacity,
              scale: buttonsScale,
              rotate: rightButtonRotate,
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
              duration: 1.5,
              delay: 0.3,
            }}
          >
            <Link
              to="/register"
              className="btn btn-secondary hero-btn-secondary"
            >
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
                className="btn-arrow"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="hero-scroll-indicator animate-bounce-gentle">
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <div className="scroll-text">Scroll to explore</div>
      </div>
    </section>
  );
};

export default HeroSection;
