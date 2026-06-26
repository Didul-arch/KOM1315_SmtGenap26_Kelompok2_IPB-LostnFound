import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiJson } from '../lib/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

const normalizeNotification = (notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.notification_type,
    read: Boolean(notification.is_read),
    createdAt: notification.created_at,
    readAt: notification.read_at,
    relatedItemId: notification.related_item_id,
    relatedClaimId: notification.related_claim_id,
});

export const NotificationsProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const syncFromPayload = (payload) => {
        const mapped = Array.isArray(payload?.data)
            ? payload.data.map(normalizeNotification)
            : [];

        setNotifications(mapped);
        setUnreadCount(Number(payload?.unread_count || 0));
    };

    const refreshNotifications = async () => {
        if (!token || !user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        setLoading(true);
        try {
            const response = await apiJson('/notifications/me', { token });
            if (response.ok && response.data) {
                syncFromPayload(response.data);
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshNotifications();
        // Poll lightly so the bell stays current while the app is open.
        const intervalId = window.setInterval(() => {
            if (token && user) {
                refreshNotifications();
            }
        }, 60000);

        return () => window.clearInterval(intervalId);
    }, [token, user]);

    const markNotificationRead = async (notificationId) => {
        if (!token || !user) return null;

        const response = await apiJson(`/notifications/${notificationId}/read`, {
            method: 'PATCH',
            token,
        });

        if (!response.ok || !response.data?.data) {
            return null;
        }

        const updated = normalizeNotification(response.data.data);
        setNotifications((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
        return updated;
    };

    const markAllNotificationsRead = async () => {
        if (!token || !user) return 0;

        const response = await apiJson('/notifications/me/read-all', {
            method: 'PATCH',
            token,
        });

        if (!response.ok) return 0;

        setNotifications((prev) =>
            prev.map((item) => ({ ...item, read: true, readAt: item.readAt || new Date().toISOString() })),
        );
        setUnreadCount(0);
        return Number(response.data?.updated_count || 0);
    };

    const value = useMemo(
        () => ({
            notifications,
            unreadCount,
            loading,
            refreshNotifications,
            markNotificationRead,
            markAllNotificationsRead,
        }),
        [notifications, unreadCount, loading],
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationsContext);