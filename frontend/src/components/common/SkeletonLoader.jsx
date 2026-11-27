import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, className = '' }) => {
  const elements = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <>
        {elements.map((_, i) => (
          <div key={i} className={`tour-card skeleton-card ${className}`}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3' }}></div>
            <div className="tour-card-content">
              <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '90%' }}></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {elements.map((_, i) => (
        <div key={i} className={`skeleton ${className}`} style={{ height: '20px', width: '100%', marginBottom: '8px' }}></div>
      ))}
    </>
  );
};

export default SkeletonLoader;
