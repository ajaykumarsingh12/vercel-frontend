import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: February 17, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            When you use BookMyHall, we collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Name and email address</li>
            <li>Phone number (for hall owners)</li>
            <li>Profile information</li>
            <li>Booking and payment information</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your bookings and payments</li>
            <li>Send you booking confirmations and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>
        </section>

        <section>
          <h2>3. Facebook Login</h2>
          <p>
            When you sign in with Facebook, we receive your basic profile information (name, email, profile picture) 
            from Facebook. We use this information only to create and manage your BookMyHall account.
          </p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method 
            of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
          </ul>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: ajaykumarsingh5963@gmail.com
          </p>
        </section>

        <div className="back-link">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
