import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Languages, LogOut, CheckCircle, Info, Shield, HelpCircle, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ title }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, logout, switchRole } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery && location.pathname !== '/browse') {
      navigate('/browse');
    }
  };

  const formatRelativeTime = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
    const absMinutes = Math.abs(diffMinutes);

    if (absMinutes < 60) {
      return diffMinutes < 0 ? `${absMinutes}m ago` : `in ${absMinutes}m`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    const absHours = Math.abs(diffHours);

    if (absHours < 24) {
      return diffHours < 0 ? `${absHours}h ago` : `in ${absHours}h`;
    }

    const diffDays = Math.round(diffHours / 24);
    const absDays = Math.abs(diffDays);
    return diffDays < 0 ? `${absDays}d ago` : `in ${absDays}d`;
  };

  const getNotificationText = (notification) => {
    const itemName = notification.title || notification.message || t('notifications');

    if (notification.type === 'claim_submitted') {
      return notification.message || t('notifClaim').replace('{name}', itemName);
    }
    if (notification.type === 'claim_approved') {
      return notification.message || t('notifApproved').replace('{name}', itemName);
    }
    if (notification.type === 'claim_rejected') {
      return notification.message || 'Your claim request was rejected.';
    }
    return notification.message || notification.title || '';
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === 'claim_approved') return <CheckCircle size={16} />;
    if (notification.type === 'claim_rejected') return <Shield size={16} />;
    if (notification.type === 'claim_submitted') return <UserCheck size={16} />;
    return <Info size={16} />;
  };

  const getNotificationColor = (notification) => {
    if (notification.type === 'claim_approved') return { bg: '#E2F9EB', fg: '#01B574' };
    if (notification.type === 'claim_rejected') return { bg: '#FFE5E5', fg: '#EE5D50' };
    if (notification.type === 'claim_submitted') return { bg: '#E1F0FE', fg: '#0075FF' };
    return { bg: '#F4F7FE', fg: '#4B5563' };
  };

  const handleNotifClick = async (notification) => {
    await markNotificationRead(notification.id);
    setShowNotif(false);

    if (notification.related_claim_id) {
      navigate(`/detail-claim/${notification.related_claim_id}`);
      return;
    }

    if (notification.related_item_id) {
      navigate(`/detail/${notification.related_item_id}`);
      return;
    }

    if (notification.type === 'claim_submitted') {
      navigate('/dashboard');
    } else if (notification.type === 'claim_approved' || notification.type === 'claim_rejected') {
      navigate('/history');
    }
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 10px',
      position: 'relative'
    }}>
      <div>
        <p style={{ fontSize: '14px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
          {t('pages')} / {title}
        </p>
        <h1 style={{ fontSize: '34px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>

      <div className="glass" style={{
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '30px',
        boxShadow: '0px 10px 30px rgba(112, 144, 176, 0.08)',
        zIndex: 10
      }}>
        {/* Global Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-primary)',
          padding: '8px 16px',
          borderRadius: '20px',
          width: '250px'
        }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          style={{
            background: 'var(--bg-primary)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ipb-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '12px',
            transition: 'all 0.2s ease'
          }}
        >
          <Languages size={18} />
          {language === 'en' ? 'EN' : 'ID'}
        </button>

        {/* Active Notification Bell Button */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              setShowProfile(false);
            }}
            style={{
              background: showNotif ? 'var(--ipb-light-blue)' : 'var(--bg-primary)',
              border: 'none',
              cursor: 'pointer',
              color: showNotif ? 'var(--ipb-blue)' : 'var(--text-secondary)',
              display: 'flex',
              padding: '10px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#EE5D50',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px white'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Glassmorphic Notification Dropdown */}
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="glass card-shadow"
                style={{
                  position: 'absolute',
                  top: '55px',
                  right: '0',
                  width: '340px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '16px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid rgba(6, 18, 92, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={16} color="var(--ipb-blue)" />
                    {t('notifications')}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--ipb-blue)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {t('markAllAsRead')}
                    </button>
                  )}
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #E0E5F2', margin: 0 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                  {notificationsLoading ? (
                    <p style={{ textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>
                      Loading notifications...
                    </p>
                  ) : notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>
                      {t('noNotifications')}
                    </p>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotifClick(notification)}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          background: notification.read ? 'transparent' : 'rgba(6, 18, 92, 0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderLeft: notification.read ? '3px solid transparent' : '3px solid var(--ipb-blue)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 18, 92, 0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = notification.read ? 'transparent' : 'rgba(6, 18, 92, 0.04)'}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: getNotificationColor(notification).bg,
                          color: getNotificationColor(notification).fg,
                          flexShrink: 0
                        }}>
                          {getNotificationIcon(notification)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: notification.read ? 500 : 600, color: 'var(--text-primary)', margin: '0 0 2px 0', lineHeight: 1.4 }}>
                            {getNotificationText(notification)}
                          </p>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Profile Circle Button */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: showProfile ? 'var(--ipb-gold)' : 'var(--ipb-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showProfile ? 'var(--ipb-blue)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              boxShadow: showProfile ? '0 0 0 3px rgba(253, 203, 44, 0.4)' : 'none'
            }}
          >
            {user && user.avatar ? (
              <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={20} />
            )}
          </div>

          {/* Glassmorphic Profile Dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="glass card-shadow"
                style={{
                  position: 'absolute',
                  top: '55px',
                  right: '0',
                  width: '280px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '20px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  border: '1px solid rgba(6, 18, 92, 0.08)'
                }}
              >
                {/* Header Information */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--ipb-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    overflow: 'hidden'
                  }}>
                    {user && user.avatar ? (
                      <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user ? user.name : t('guest')}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user ? user.email : (language === 'en' ? 'Browsing as Guest' : 'Menjelajah sebagai Tamu')}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: user && user.role === 'Admin' ? '#FFE5E5' : '#E1F0FE',
                  color: user && user.role === 'Admin' ? '#EE5D50' : '#0075FF',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  alignSelf: 'flex-start',
                  letterSpacing: '0.5px'
                }}>
                  {user ? user.role : t('guest')}
                </div>

                {/* Additional Profile Info (Only shown for logged-in IPB/Civitas/Admin users) */}
                {user && (
                  <>
                    <hr style={{ border: 'none', borderTop: '1px solid #E0E5F2', margin: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {user.nim && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t('studentId')}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {user.nim}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{t('department')}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.role === 'Admin' ? 'Direktorat Sistem Informasi' : (user.department || 'Ilmu Komputer')}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid #E0E5F2', margin: 0 }} />

                {/* Conditional CTAs based on login state */}
                {user ? (
                  /* Logout Button for Signed-In Users */
                  <button
                    onClick={() => {
                      logout();
                      setShowProfile(false);
                      navigate('/login');
                    }}
                    style={{
                      background: '#FFE5E5',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#EE5D50',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FFD2D2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FFE5E5'}
                  >
                    <LogOut size={16} />
                    {t('signOut')}
                  </button>
                ) : (
                  /* Login and Signup Action CTAs for Guests */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate('/login');
                      }}
                      style={{
                        background: 'var(--ipb-blue)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '13px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                    >
                      {t('signIn')}
                    </button>
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate('/signup');
                      }}
                      style={{
                        background: 'white',
                        border: '1.5px solid var(--ipb-blue)',
                        borderRadius: '12px',
                        color: 'var(--ipb-blue)',
                        fontWeight: 700,
                        fontSize: '13px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 117, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      {t('signUp')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
