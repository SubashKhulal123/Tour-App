import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { apiRequest } from '../../api/client';

const RevenueChart = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('revenue');

  useEffect(() => {
    apiRequest('/bookings/monthly-stats')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px', color: 'var(--muted)' }}>Loading analytics...</div>;
  if (!stats.length) return <div style={{ padding: '20px', color: 'var(--muted)' }}>No booking data yet.</div>;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Analytics</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>Monthly booking performance</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setView('revenue')}
            style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: view === 'revenue' ? 'var(--teal)' : 'var(--surface-soft)', color: view === 'revenue' ? 'white' : 'var(--ink)' }}
          >
            Revenue
          </button>
          <button
            onClick={() => setView('bookings')}
            style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: view === 'bookings' ? 'var(--teal)' : 'var(--surface-soft)', color: view === 'bookings' ? 'white' : 'var(--ink)' }}
          >
            Bookings
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        {view === 'revenue' ? (
          <LineChart data={stats} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px' }}
              formatter={v => [`$${v}`, 'Revenue']}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 5, fill: '#0d9488' }} activeDot={{ r: 7 }} name="Revenue ($)" />
          </LineChart>
        ) : (
          <BarChart data={stats} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px' }}
              formatter={v => [v, 'Bookings']}
            />
            <Legend />
            <Bar dataKey="bookings" fill="#0d9488" radius={[6, 6, 0, 0]} name="Bookings" />
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '120px', background: 'var(--surface-soft)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--teal)' }}>
            ${stats.reduce((a, s) => a + s.revenue, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total Revenue</div>
        </div>
        <div style={{ flex: 1, minWidth: '120px', background: 'var(--surface-soft)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--teal)' }}>
            {stats.reduce((a, s) => a + s.bookings, 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total Bookings</div>
        </div>
        <div style={{ flex: 1, minWidth: '120px', background: 'var(--surface-soft)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--teal)' }}>
            ${stats.length ? Math.round(stats.reduce((a, s) => a + s.revenue, 0) / stats.reduce((a, s) => a + s.bookings, 0)) : 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Avg. Booking Value</div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
