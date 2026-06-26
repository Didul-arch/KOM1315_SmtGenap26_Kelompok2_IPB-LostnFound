import React from 'react';

const StatCard = ({ label, value, icon, color }) => {
  return (
    <div className="glass" style={{
      padding: '20px',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color || 'var(--ipb-blue)'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</p>
        <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
