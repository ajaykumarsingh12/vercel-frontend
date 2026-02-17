import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const DataDeletion = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Data Deletion Instructions</h1>
        <p className="last-updated">Last updated: February 17, 2026</p>

        <section>
          <h2>How to Delete Your Data</h2>
          <p>
            At BookMyHall, we respect your privacy and your right to control your personal data. 
            If you wish to delete your account and all associated data, please follow these steps:
          </p>
        </section>

        <section>
          <h2>Option 1: Delete Through Your Account</h2>
          <ol style={{ marginLeft: '30px', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '10px' }}>Log in to your BookMyHall account</li>
            <li style={{ marginBottom: '10px' }}>Go to Profile Settings</li>
            <li style={{ marginBottom: '10px' }}>Scroll down to "Delete Account" section</li>
            <li style={{ marginBottom: '10px' }}>Click "Delete My Account"</li>
            <li style={{ marginBottom: '10px' }}>Confirm your decision</li>
          </ol>
        </section>

        <section>
          <h2>Option 2: Contact Us Directly</h2>
          <p>
            If you're unable to access your account or prefer to contact us directly, 
            please send an email to:
          </p>
          <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            ajaykumarsingh5963@gmail.com
          </p>
          <p>Include the following information in your email:</p>
          <ul>
            <li>Your full name</li>
            <li>Email address associated with your account</li>
            <li>Subject line: "Data Deletion Request"</li>
          </ul>
        </section>

        <section>
          <h2>What Data Will Be Deleted</h2>
          <p>When you request data deletion, we will permanently remove:</p>
          <ul>
            <li>Your account information (name, email, phone number)</li>
            <li>Profile picture and bio</li>
            <li>Booking history</li>
            <li>Favorite halls list</li>
            <li>Reviews and ratings you've posted</li>
            <li>Any other personal data associated with your account</li>
          </ul>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            Some data may be retained for legal or business purposes, such as:
          </p>
          <ul>
            <li>Transaction records (required for accounting and tax purposes)</li>
            <li>Data needed to resolve disputes or enforce our terms</li>
          </ul>
          <p>
            This data will be kept only as long as legally required and will not be used 
            for any other purpose.
          </p>
        </section>

        <section>
          <h2>Processing Time</h2>
          <p>
            Data deletion requests are typically processed within 30 days. You will receive 
            a confirmation email once your data has been deleted.
          </p>
        </section>

        <section>
          <h2>Facebook Login Data</h2>
          <p>
            If you signed up using Facebook Login, deleting your BookMyHall account will 
            remove all data we received from Facebook. However, this does not affect your 
            Facebook account or the data Facebook holds about you.
          </p>
          <p>
            To manage your Facebook data, please visit your Facebook account settings.
          </p>
        </section>

        <section>
          <h2>Questions?</h2>
          <p>
            If you have any questions about data deletion, please contact us at:
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

export default DataDeletion;
