import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <div className="not-authorized-container">
      <div className="not-authorized-box">
        <h1>🚫</h1>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <p className="message">Access Denied: Insufficient clearance for critical information.</p>
        <Link to="/dashboard" className="btn">Return to Dashboard</Link>
      </div>
      <style>{`
        .not-authorized-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
        }
        .not-authorized-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 400px;
        }
        .not-authorized-box h1 {
          font-size: 64px;
          margin: 0;
        }
        .not-authorized-box h2 {
          color: #e74c3c;
          margin: 10px 0;
        }
        .not-authorized-box p {
          color: #666;
          margin: 10px 0;
        }
        .not-authorized-box .message {
          color: #e74c3c;
          font-weight: bold;
          font-size: 14px;
          padding: 10px;
          background: #f8d7da;
          border-radius: 5px;
          margin: 20px 0;
        }
        .not-authorized-box .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .not-authorized-box .btn:hover {
          background: #2980b9;
        }
      `}</style>
    </div>
  );
};

export default NotAuthorized;