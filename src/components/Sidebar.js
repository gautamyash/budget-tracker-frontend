import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, LogOut, Wallet } from 'lucide-react';

const Sidebar = () => {
  const performLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
        color: '#6366f1'
      }}>
        <div style={{
          backgroundColor: '#6366f1',
          padding: '8px',
          borderRadius: '10px',
          color: 'white'
        }}>
          <Wallet size={24} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
          StashDash
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <NavLink to="/" style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          color: isActive ? '#6366f1' : '#64748b',
          backgroundColor: isActive ? '#f5f7ff' : 'transparent',
          fontWeight: 600,
          transition: 'all 0.2s'
        })}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        <NavLink to="/transactions" style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          color: isActive ? '#6366f1' : '#64748b',
          backgroundColor: isActive ? '#f5f7ff' : 'transparent',
          fontWeight: 600,
          transition: 'all 0.2s'
        })}>
          <ReceiptText size={20} />
          Transactions
        </NavLink>
      </nav>

      <button onClick={performLogout} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        color: '#ef4444',
        backgroundColor: 'transparent',
        fontWeight: 600,
        width: '100%',
        marginTop: 'auto',
        border: 'none',
        cursor: 'pointer'
      }}>
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
