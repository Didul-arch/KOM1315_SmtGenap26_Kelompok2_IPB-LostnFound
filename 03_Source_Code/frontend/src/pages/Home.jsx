import React from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import { motion } from 'framer-motion';
import { Search, PlusCircle, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { items: allItems } = useItems();
  
  const recentItems = allItems.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar title={t('home')} />

      {/* Hero Section */}
      <div className="glass card-shadow" style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', // Using a vibrant purple for the welcome hero
        padding: '80px 60px',
        borderRadius: '30px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '550px' }}>
          <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '20px', lineHeight: '1.2' }}>
            {t('welcome')} <span style={{ color: 'var(--ipb-gold)' }}>IPB Lost & Found</span>
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', marginBottom: '40px' }}>
            {t('tagline')}
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/report" className="btn" style={{ background: 'white', color: '#4F46E5', padding: '16px 32px' }}>
              <PlusCircle size={20} />
              {t('reportItem')}
            </Link>
            {!user ? (
              <Link to="/signup" className="btn" style={{ background: 'var(--ipb-gold)', color: 'var(--ipb-blue)', padding: '16px 32px' }}>
                <User size={20} />
                Sign Up
              </Link>
            ) : (
              <Link to="/dashboard" className="btn" style={{ background: 'var(--ipb-gold)', color: 'var(--ipb-blue)', padding: '16px 32px' }}>
                <ArrowRight size={20} />
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* 3D-like Asset Simulation */}
        <div style={{ position: 'relative', zIndex: 1, width: '400px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ 
             width: '300px', 
             height: '300px', 
             background: 'rgba(255, 255, 255, 0.1)', 
             backdropFilter: 'blur(20px)',
             borderRadius: '50%',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             border: '1px solid rgba(255, 255, 255, 0.2)'
           }}>
             <Search size={120} color="white" style={{ opacity: 0.8 }} />
           </div>
           {/* Floating elements */}
           <motion.div 
             animate={{ y: [0, -20, 0] }} 
             transition={{ duration: 3, repeat: Infinity }}
             style={{ position: 'absolute', top: '20px', right: '40px', background: 'var(--ipb-gold)', padding: '15px', borderRadius: '15px', color: 'var(--ipb-blue)' }}
           >
             <PlusCircle size={32} />
           </motion.div>
        </div>
        
        {/* Abstract shapes */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
      </div>

      {/* Quick Stats / Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '50px' }}>
        <div className="glass" style={{ padding: '30px', background: 'white' }}>
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--ipb-blue)' }}>{t('step1Title')}</span>
          </h3>
          <p>{t('step1Desc')}</p>
        </div>
        <div className="glass" style={{ padding: '30px', background: 'white' }}>
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--ipb-blue)' }}>{t('step2Title')}</span>
          </h3>
          <p>{t('step2Desc')}</p>
        </div>
        <div className="glass" style={{ padding: '30px', background: 'white' }}>
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--ipb-blue)' }}>{t('step3Title')}</span>
          </h3>
          <p>{t('step3Desc')}</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>{t('latestDiscoveries')}</h2>
          <Link to="/browse" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ipb-blue)', fontWeight: '700' }}>
            {t('viewAll')} <ArrowRight size={18} />
          </Link>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
