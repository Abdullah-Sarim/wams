import React, { useState } from 'react';

const Logout = () => {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    
    fetch('/api/system-authorization/logout', { method: 'POST' })
      .then(() => { window.location.href = '/login'; })
      .catch(() => { window.location.href = '/login'; });
  }, []);

  return <div className="loading">Logging out...</div>;
};

export default Logout;