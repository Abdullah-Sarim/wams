import React, { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/system-authorization/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType })
      });
      const data = await response.json();

      if (data.success) {
        window.location.href = data.userType === 'dealer' 
          ? '/dealer-management/dealers-orders' 
          : '/stock-management/track-inventory';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>WAMS Login</h1>
        <h2>Web-Based Automated Manufacturing System</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User Type</label>
            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
              <option value="staff">Staff</option>
              <option value="dealer">Dealer</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-links">
          <a href="/signup">Sign Up</a>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .login-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          width: 400px;
        }
        .login-box h1 { margin: 0 0 10px; color: #333; text-align: center; }
        .login-box h2 { margin: 0 0 30px; font-size: 14px; color: #666; text-align: center; font-weight: normal; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; color: #333; font-weight: 500; }
        .form-group input, .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        }
        button:hover { background: #5568d3; }
        button:disabled { background: #ccc; }
        .error-message { color: #e74c3c; margin-bottom: 15px; padding: 10px; background: #f8d7da; border-radius: 5px; }
        .login-links { margin-top: 20px; text-align: center; }
        .login-links a { color: #667eea; text-decoration: none; }
      `}</style>
    </div>
  );
};

export default Login;