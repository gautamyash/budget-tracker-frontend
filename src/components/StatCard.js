import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, color, icon: Icon, trend }) => {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      className="card" 
      style={{ borderLeft: `4px solid ${color}`, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute',
        right: '-10px',
        top: '-10px',
        opacity: 0.1,
        transform: 'rotate(-15deg)'
      }}>
        {Icon && <Icon size={80} color={color} />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', position: 'relative', zIndex: 1 }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>{title}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
              ${parseFloat(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        <div style={{ 
          backgroundColor: `${color}15`, 
          color: color, 
          padding: '10px', 
          borderRadius: '12px' 
        }}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
      {trend && (
        <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
          <span style={{ color: trend > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span> vs last month
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
