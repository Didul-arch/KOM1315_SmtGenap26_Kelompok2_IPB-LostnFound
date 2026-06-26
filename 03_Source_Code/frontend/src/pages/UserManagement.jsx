import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, Eye, ShieldCheck, CircleCheckBig, Users, UserCheck, Shield, UserX, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { resolveAssetUrl, getAssetFileName, isPreviewableImage } from '../lib/assetUrl';

/* ───── Spinner component ───── */
const Spinner = ({ size = 16, color = 'currentColor' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <Loader2 size={size} color={color} />
  </motion.div>
);

/* ───── Skeleton primitives ───── */
const skeletonKeyframes = `
@keyframes um-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

const SkeletonBox = ({ width = '100%', height = 16, borderRadius = 8, style = {} }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e8ecf1 25%, #f3f6f9 37%, #e8ecf1 63%)',
      backgroundSize: '800px 100%',
      animation: 'um-shimmer 1.6s ease-in-out infinite',
      ...style,
    }}
  />
);

const SkeletonStatCard = () => (
  <div
    style={{
      borderRadius: '20px',
      padding: '28px',
      background: '#f0f2f5',
      animation: 'um-shimmer 1.6s ease-in-out infinite',
      backgroundImage: 'linear-gradient(90deg, #e8ecf1 25%, #f3f6f9 37%, #e8ecf1 63%)',
      backgroundSize: '800px 100%',
      height: 120,
    }}
  />
);

const SkeletonUserCard = () => (
  <div
    style={{
      border: '1px solid #e5e7eb',
      borderRadius: '18px',
      padding: '18px',
      background: '#fff',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ flex: 1 }}>
        <SkeletonBox width="60%" height={20} style={{ marginBottom: 10 }} />
        <SkeletonBox width="80%" height={14} />
      </div>
      <SkeletonBox width={80} height={26} borderRadius={999} />
    </div>
    <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
      <SkeletonBox height={40} borderRadius={12} />
      <SkeletonBox height={40} borderRadius={12} />
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <SkeletonBox height={42} borderRadius={12} style={{ flex: 1 }} />
      <SkeletonBox width={90} height={42} borderRadius={12} />
    </div>
  </div>
);

const UserManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  // Fetch users on mount
  useEffect(() => {
    if (token) {
      fetchUsers();
      return;
    }

    setUsers([]);
    setFilteredUsers([]);
    setLoading(false);
  }, [token]);

  // Filter users when search or filters change
  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await apiJson('/users/', { token });
      if (result.ok && result.data) {
        setUsers(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.fullname || '').toLowerCase().includes(query) ||
          (user.email || '').toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => {
        const userRole = (user.role || '').toLowerCase();
        return userRole === roleFilter.toLowerCase();
      });
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((user) => user.is_active);
    } else if (statusFilter === 'suspended') {
      filtered = filtered.filter((user) => !user.is_active);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setDeleting(userId);
    try {
      const result = await apiJson(`/users/${userId}`, {
        method: 'DELETE',
        token,
      });
      if (result.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        console.error('Failed to delete user:', result.data);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setDeleting(null);
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => (u.role || '').toLowerCase() === 'admin').length;
  const suspendedCount = users.filter((u) => !u.is_active).length;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: <Users size={22} />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', shadow: 'rgba(59,130,246,0.35)' },
    { label: 'Active Users', value: activeUsers, icon: <UserCheck size={22} />, gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', shadow: 'rgba(34,197,94,0.35)' },
    { label: 'Admins', value: adminCount, icon: <Shield size={22} />, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', shadow: 'rgba(139,92,246,0.35)' },
    { label: 'Suspended', value: suspendedCount, icon: <UserX size={22} />, gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', shadow: 'rgba(249,115,22,0.35)' },
  ];

  return (
    <div style={{ padding: '40px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Inject shimmer keyframe */}
      <style>{skeletonKeyframes}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px' }}>User Management</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Manage system users and permissions</p>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            : stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  style={{
                    background: stat.gradient,
                    borderRadius: '20px',
                    padding: '28px',
                    color: 'white',
                    boxShadow: `0 8px 24px ${stat.shadow}`,
                    cursor: 'default',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '14px', opacity: 0.85, margin: '0 0 10px', fontWeight: 500, letterSpacing: '0.3px' }}>{stat.label}</p>
                      <p style={{ fontSize: '36px', fontWeight: '800', margin: 0, lineHeight: 1 }}>{stat.value}</p>
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Search and Filters */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="civitas">Civitas</option>
              <option value="umum">Umum</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Cards */}
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '20px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonUserCard key={i} />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No users found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredUsers.map((user, index) => {
                const isAdmin = (user.role || '').toLowerCase() === 'admin';
                const isDeleting = deleting === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '18px',
                      padding: '18px',
                      background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{user.fullname}</h3>
                          {isAdmin ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: '#eef2ff', color: '#4338ca', fontSize: '12px', fontWeight: '700' }}>
                              <ShieldCheck size={14} />
                              Admin
                            </span>
                          ) : null}
                        </div>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{user.email}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: user.is_active ? '#dcfce7' : '#fef3c7', color: user.is_active ? '#166534' : '#92400e', fontSize: '12px', fontWeight: '700' }}>
                          <CircleCheckBig size={14} />
                          {user.is_active ? 'Active' : 'Suspended'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '12px' }}>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Role</span>
                        <strong style={{ color: '#111827', fontSize: '13px' }}>{user.role}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '12px' }}>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Identity</span>
                        <div style={{ textAlign: 'right', maxWidth: '180px' }}>
                          {user.identity_document && isPreviewableImage(user.identity_document) ? (
                            <img
                              src={resolveAssetUrl(user.identity_document)}
                              alt={`${user.fullname || 'User'} identity document`}
                              style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'block', marginLeft: 'auto', marginBottom: '8px' }}
                            />
                          ) : null}
                          <strong style={{ color: '#111827', fontSize: '13px' }}>{user.identity_number || getAssetFileName(user.identity_document) || '-'}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => navigate(`/users/${user.id}`)}
                        style={{
                          flex: 1,
                          background: '#0f172a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: '700',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
                      >
                        <Eye size={16} />
                        Open Form
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isDeleting}
                        style={{
                          background: isDeleting ? '#fecaca' : '#fee2e2',
                          border: 'none',
                          color: '#dc2626',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: '700',
                          opacity: isDeleting ? 0.7 : 1,
                          transition: 'all 0.2s ease',
                          minWidth: 90,
                        }}
                      >
                        {isDeleting ? (
                          <>
                            <Spinner size={16} color="#dc2626" />
                            <span style={{ fontSize: '13px' }}>...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
          Showing {filteredUsers.length} of {totalUsers} users
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
