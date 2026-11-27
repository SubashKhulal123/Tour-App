import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useToast } from '../components/common/ToastNotification';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest(`/auth/resetPassword/${token}`, {
        method: 'PATCH',
        body: { password }
      });
      login(response.data.user, response.token);
      addToast("Password reset successfully!", "success");
      navigate('/dashboard');
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-panel animate-fade-in">
        <h1 style={{ marginBottom: '8px' }}>Reset Password</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Please enter your new password below.</p>
        
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            <span>New Password</span>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength="8"
            />
          </label>
          
          <Button type="submit" variant="primary" className="full-width" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
