import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ 
          marginLeft: '260px', 
          flex: 1, 
          padding: '32px',
          maxWidth: '1440px',
          margin: '0 0 0 260px'
        }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
