import React, { useState } from 'react';

const Signup = () => {
  const [userType, setUserType] = useState('dealer');
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', contact_person: '', phone: '', address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let endpoint = userType === 'dealer' 
        ? '/api/dealer-management/create-dealer-profile' 
        : '/api/supplier-management/suppliers';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>WAMS Registration</h1>
        <h2>Create your account</h2>
        
        {success ? (
          <div className="success-message">Registration successful! Redirecting to login...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Account Type</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="dealer">Dealer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>{userType === 'dealer' ? 'Company Name' : 'Supplier Company Name'}</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label>Contact Person Name</label>
              <input type="text" value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>Address</label>
              <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows="2" />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            <button type="submit">Register as {userType === 'dealer' ? 'Dealer' : 'Supplier'}</button>
          </form>
        )}
        <div className="login-links">
          <a href="/login">Already have an account? Login</a>
        </div>
      </div>
      <style>{`
        .signup-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .signup-box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 420px; }
        .signup-box h1 { margin: 0 0 5px; color: #333; text-align: center; }
        .signup-box h2 { margin: 0 0 20px; font-size: 14px; color: #666; text-align: center; font-weight: normal; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; color: #333; font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
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