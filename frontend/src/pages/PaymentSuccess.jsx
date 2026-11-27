import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '20px', maxWidth: '480px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CheckCircle size={72} color="#0d9488" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '8px' }}>
          Your booking has been confirmed. A confirmation email has been sent to you.
        </p>
        {bookingId && (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '28px' }}>
            Booking ID: <code style={{ background: 'var(--surface-soft)', padding: '2px 6px', borderRadius: '4px' }}>{bookingId}</code>
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
          <Link to="/tours">
            <Button variant="secondary">Browse More Tours</Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccess;
