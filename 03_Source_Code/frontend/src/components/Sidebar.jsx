import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Layout, Clock, LogOut, ChevronLeft, ChevronRight, User, Users, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import ipbLogo from '../assets/ipb-logo.png';
import ipbLogoRound from '../assets/ipb-logo-round.png';

const Sidebar = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load collapse state from LocalStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  // Synchronize collapse state to root CSS Variable --sidebar-width
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '80px' : '280px'
    );
  }, [isCollapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { icon: <Home size={20} />, label: t('home'), path: '/' },
    { icon: <Search size={20} />, label: t('browse'), path: '/browse' },
    { icon: <PlusCircle size={20} />, label: t('report'), path: '/report' },
    { icon: <Layout size={20} />, label: t('dashboard'), path: '/dashboard' },
    { icon: <Clock size={20} />, label: t('history'), path: '/history' },
    { icon: <User size={20} />, label: 'My Profile', path: '/users/me' },
  ];

  const adminMenuItems = [
    { icon: <Layout size={20} />, label: 'Admin Dashboard', path: '/dashboard' },
    { icon: <Search size={20} />, label: 'All Items', path: '/browse' },
    { icon: <PlusCircle size={20} />, label: 'Report', path: '/report' },
    { icon: <Clock size={20} />, label: 'Activity History', path: '/history' },
    { icon: <Users size={20} />, label: 'User Management', path: '/users' },
    { icon: <ShieldAlert size={20} />, label: 'Audit Logs', path: '/admin/audit-logs' },
    { icon: <User size={20} />, label: 'My Profile', path: '/users/me' },
  ];

  const menuItems = user?.role === 'Admin' ? adminMenuItems : userMenuItems;

  return (
    <aside className="glass" style={{
      width: 'var(--sidebar-width)',
      height: 'calc(100vh - 40px)',
      position: 'fixed',
      top: '20px',
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      padding: isCollapsed ? '30px 10px' : '30px 20px',
      zIndex: 100,
      transition: 'var(--transition)',
      boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)'
    }}>
      {/* Dynamic Logo Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '40px',
        padding: '0 5px',
        height: '45px',
        overflow: 'hidden'
      }}>
        {isCollapsed ? (
          /* Circular Emblem zoomed in on official crest */
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            border: '1px solid rgba(6, 18, 92, 0.08)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
            flexShrink: 0
          }}>
            <img
              src={ipbLogoRound}
              alt="IPB"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        ) : (
          /* Full Horizontal IPB Logo + Stylized FoundIT Text Branding */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              justifyContent: 'flex-start'
            }}
          >
            <img
              src={ipbLogoRound}
              alt="IPB"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', letterSpacing: '0.2px' }}>
              <span style={{ color: 'var(--ipb-blue)', fontWeight: '600', fontSize: '22px' }}>Found</span>
              <span style={{ color: '#D9A406', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>IT</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Manual Collapse / Expand Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '32px',
          right: '-14px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'white',
          border: '1px solid rgba(6, 18, 92, 0.12)',
          boxShadow: '0px 4px 10px rgba(112, 144, 176, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ipb-blue)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>

      {/* Navigation Menu */}
      <nav style={{ flex: 1 }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                title={isCollapsed ? item.label : ''}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? '0' : '12px',
                  padding: isCollapsed ? '14px' : '16px 20px',
                  borderRadius: '16px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                  background: isActive ? 'white' : 'transparent',
                  transition: 'var(--transition)',
                  boxShadow: isActive ? '0px 10px 20px rgba(112, 144, 176, 0.12)' : 'none',
                })}
              >
                <span style={{
                  color: 'var(--ipb-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </span>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Footer (Only shown for logged-in users) */}
      {user && (
        <div style={{
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleLogout}
            className="btn"
            title={isCollapsed ? t('signOut') : ''}
            style={{
              width: '100%',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: '#EE5D50',
              padding: isCollapsed ? '14px' : '12px 24px',
              borderRadius: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ whiteSpace: 'nowrap', marginLeft: '12px' }}
                >
                  {t('signOut')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
