import React, { useState } from 'react';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '', password: '', name: '', role: 'User', email: '', phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/system-authorization/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>WAMS Sign Up</h1>
        
        {success ? (
          <div className="success-message">Registration successful! Redirecting to login...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit">Sign Up</button>
          </form>
        )}
        <div className="login-links">
          <a href="/login">Already have an account? Login</a>
        </div>
      </div>
      <style>{`
        .signup-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .signup-box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 400px; }
        .signup-box h1 { margin: 0 0 20px; color: #333; text-align: center; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; color: #333; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
        button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
        button:hover { background: #5568d3; }
        .error-message { color: #e74c3c; margin-bottom: 15px; padding: 10px; background: #f8d7da; border-radius: 5px; }
        .success-message { color: #27ae60; padding: 20px; text-align: center; background: #d4edda; border-radius: 5px; }
        .login-links { margin-top: 20px; text-align: center; }
        .login-links a { color: #667eea; text-decoration: none; }
      `}</style>
    </div>
  );
};

export default Signup;