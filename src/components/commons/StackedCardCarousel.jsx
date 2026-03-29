import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HallCard from "./HallCard";
import "./StackedCardCarousel.css";

const StackedCardCarousel = ({ halls, renderStars }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);
  const total = halls.length;

  const goTo = (index, dir) => {
    setDirection(dir);
    setActiveIndex((index + total) % total);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(activeIndex + 1, 1) : goTo(activeIndex - 1, -1);
    }
  };

  // pos0 = active (front), pos1 = first behind, pos2 = second behind
  const stackedCards = [2, 1, 0].map((offset) => ({
    index: (activeIndex + offset) % total,
    pos: offset,
  }));

  return (
    <div className="stacked-carousel">
      <div
        className="stacked-carousel__stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {stackedCards.map(({ index, pos }) => (
          <div key={`${pos}-${index}`} className={`stacked-card stacked-card--${pos}`}>
            {pos === 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ x: direction * 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -direction * 60, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  style={{ width: "100%" }}
                >
                  <HallCard hall={halls[index]} renderStars={renderStars} />
                </motion.div>
              </AnimatePresence>
            ) : (
              <HallCard hall={halls[index]} renderStars={renderStars} />
            )}
          </div>
        ))}
      </div>

      {/* Dots — visual only, no click */}
      <div className="stacked-carousel__dots">
        {halls.map((_, i) => (
          <span key={i} className={`sc-dot${i === activeIndex ? " sc-dot--active" : ""}`} />
        ))}
      </div>
    </div>
  );
};

export default StackedCardCarousel;
