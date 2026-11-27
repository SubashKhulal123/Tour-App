import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useToast } from '../components/common/ToastNotification';
import Button from '../components/common/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest('/auth/forgotPassword', {
        method: 'POST',
        body: { email }
      });
      addToast(response.message || "Reset link sent to your email", "success");
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-panel animate-fade-in">
        <h1 style={{ marginBottom: '8px' }}>Forgot Password</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Enter your email address and we will send you a link to reset your password.</p>
        
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </label>
          
          <Button type="submit" variant="primary" className="full-width" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        
        <div className="auth-switch">
          Remember your password? <Link to="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
