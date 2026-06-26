import React, { useState, useEffect } from 'react';
import { apiJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Globe, Server, User, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

const AuditLogs = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (token) {
      fetchLogs(page);
    }
  }, [token, page]);

  const fetchLogs = async (currentPage) => {
    setLoading(true);
    try {
      const result = await apiJson(`/admin/audit-logs?page=${currentPage}&limit=${limit}`, { token });
      if (result.ok && result.data) {
        setLogs(result.data.data || []);
        setTotalPages(result.data.total_pages || 1);
        setTotalItems(result.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d);
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return { bg: '#dcfce7', text: '#166534' };
    if (code >= 300 && code < 400) return { bg: '#fef9c3', text: '#854d0e' };
    if (code >= 400 && code < 500) return { bg: '#fef2f2', text: '#991b1b' };
    if (code >= 500) return { bg: '#fecaca', text: '#991b1b' };
    return { bg: '#f3f4f6', text: '#374151' };
  };

  return (
    <div style={{ padding: '40px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.2)'
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px', color: '#111827' }}>System Audit Logs</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Monitor system activities, endpoint access, and security events</p>
          </div>
        </div>

        {/* Table Container */}
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div style={{ padding: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
              <Spinner size={32} color="#4f46e5" />
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Loading logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>No audit logs found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timestamp</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IP / Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}
                    >
                      <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '14px', fontWeight: '500' }}>
                          <Calendar size={16} color="#94a3b8" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '14px' }}>
                          <User size={16} color="#94a3b8" />
                          {log.user_email || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Anonymous</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                        <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Server size={14} color="#64748b" />
                          {log.action}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                          {log.endpoint}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                        <span style={{
                          background: getStatusColor(log.status_code).bg,
                          color: getStatusColor(log.status_code).text,
                          padding: '6px 12px',
                          borderRadius: '99px',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}>
                          {log.status_code}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', verticalAlign: 'top', maxWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', marginBottom: '4px' }}>
                          <Globe size={14} color="#94a3b8" />
                          {log.ip_address || 'Unknown IP'}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.user_agent}>
                          {log.user_agent || 'Unknown Device'}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>
                Showing <strong style={{ color: '#0f172a' }}>{(page - 1) * limit + 1}</strong> to <strong style={{ color: '#0f172a' }}>{Math.min(page * limit, totalItems)}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> entries
              </span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
                    border: '1px solid #cbd5e1', background: page === 1 ? '#f1f5f9' : 'white',
                    color: page === 1 ? '#94a3b8' : '#334155', fontWeight: '600', fontSize: '14px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
                    border: '1px solid #cbd5e1', background: page === totalPages ? '#f1f5f9' : 'white',
                    color: page === totalPages ? '#94a3b8' : '#334155', fontWeight: '600', fontSize: '14px',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuditLogs;
