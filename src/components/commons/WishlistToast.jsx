import { createPortal } from "react-dom";
import "./WishlistToast.css";

const WishlistToast = ({ message, visible }) => {
  return createPortal(
    <div className={`wishlist-toast ${visible ? "wishlist-toast--visible" : ""}`}>
      <span className="wishlist-toast__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#4caf50">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z" />
        </svg>
      </span>
      <span className="wishlist-toast__message">{message}</span>
    </div>,
    document.body
  );
};

export default WishlistToast;
