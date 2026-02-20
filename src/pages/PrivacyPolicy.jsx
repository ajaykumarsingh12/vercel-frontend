import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: February 20, 2026</p>
        </div>

        <div className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to BookMyHall. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we handle your personal data when you use our platform.
          </p>
        </div>

        <div className="privacy-section">
          <h2>2. Data Collection</h2>
          <p>When you use Facebook Login, we collect the following information:</p>
          <ul>
            <li><strong>Name:</strong> Your full name from your Facebook profile</li>
            <li><strong>Email Address:</strong> Your email associated with Facebook</li>
            <li><strong>Profile Picture:</strong> Your Facebook profile picture</li>
            <li><strong>Facebook User ID:</strong> A unique identifier from Facebook</li>
          </ul>
          <p>
            We only collect data that is necessary for creating and managing your account on BookMyHall.
          </p>
        </div>

        <div className="privacy-section">
          <h2>3. Data Usage</h2>
          <p>Your data is used for the following purposes:</p>
          <ul>
            <li>Creating and managing your user account</li>
            <li>Authenticating your identity when you log in</li>
            <li>Personalizing your experience on our platform</li>
            <li>Communicating with you about bookings and services</li>
            <li>Improving our services and user experience</li>
          </ul>
          <p>
            We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </p>
        </div>

        <div className="privacy-section">
          <h2>4. Data Storage & Security</h2>
          <p>
            Your data is securely stored in our database with industry-standard encryption. 
            We implement appropriate technical and organizational measures to protect your personal data 
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </div>

        <div className="privacy-section">
          <h2>5. Data Deletion</h2>
          <p>You have the right to delete your data at any time. You can do this by:</p>
          <ul>
            <li>
              <strong>Option 1:</strong> Go to your Facebook Settings → Apps and Websites → 
              Find "BookMyHall" → Click "Remove"
            </li>
            <li>
              <strong>Option 2:</strong> Contact us directly at{' '}
              <a href="mailto:support@bookmyhall.com">support@bookmyhall.com</a> 
              {' '}and request account deletion
            </li>
            <li>
              <strong>Option 3:</strong> Delete your account from your BookMyHall dashboard settings
            </li>
          </ul>
          <p>
            Upon deletion request, we will remove all your personal data from our systems within 30 days.
          </p>
        </div>

        <div className="privacy-section">
          <h2>6. Cookies & Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to maintain your login session and 
            improve your browsing experience. You can control cookie settings through your browser preferences.
          </p>
        </div>

        <div className="privacy-section">
          <h2>7. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Facebook Login:</strong> For authentication purposes</li>
            <li><strong>Cloudinary:</strong> For image storage and management</li>
            <li><strong>Payment Gateways:</strong> For processing booking payments</li>
          </ul>
          <p>
            These services have their own privacy policies, and we encourage you to review them.
          </p>
        </div>

        <div className="privacy-section">
          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not intended for users under the age of 18. We do not knowingly collect 
            personal information from children under 18.
          </p>
        </div>

        <div className="privacy-section">
          <h2>9. Changes to Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes 
            by posting the new privacy policy on this page and updating the "Last updated" date.
          </p>
        </div>

        <div className="privacy-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:support@bookmyhall.com">support@bookmyhall.com</a></li>
            <li><strong>Phone:</strong> +91 8081721560</li>
            <li><strong>Address:</strong> Mumbai, India</li>
          </ul>
        </div>

        <div className="privacy-footer">
          <Link to="/" className="back-home-btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
