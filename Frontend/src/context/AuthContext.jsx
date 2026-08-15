import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);

    // Helper to decode and validate JWT payload
    const decodeToken = (token) => {
        if (!token || typeof token !== 'string') return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            // Fix base64url padding
            let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const pad = base64.length % 4;
            if (pad) {
                if (pad === 1) throw new Error('InvalidLengthError');
                base64 += new Array(5 - pad).join('=');
            }

            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decodedPayload = JSON.parse(jsonPayload);

            // Check if token is expired (with 10-second buffer)
            if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now() + 10000) {
                console.warn("Stored access token is expired");
                return null;
            }

            // Extract roles
            let roles = [];
            if (decodedPayload.roles) {
                roles = Array.isArray(decodedPayload.roles) ? decodedPayload.roles : [decodedPayload.roles];
            } else if (decodedPayload.role) {
                roles = [decodedPayload.role];
            }

            const isAdmin = roles.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN');

            // Load any cached profile data
            let savedProfile = {};
            try {
                const stored = localStorage.getItem('trainUserProfile');
                if (stored) savedProfile = JSON.parse(stored);
            } catch (e) {}

            const firstName = decodedPayload.firstName || savedProfile.firstName || '';
            const lastName = decodedPayload.lastName || savedProfile.lastName || '';
            const constructedFullName = (firstName && lastName) ? `${firstName} ${lastName}`.trim() : (firstName || lastName || '');
            
            const fullName = decodedPayload.fullName || 
                             savedProfile.fullName || 
                             constructedFullName ||
                             decodedPayload.username ||
                             savedProfile.username ||
                             (decodedPayload.email ? decodedPayload.email.split('@')[0] : null) ||
                             (savedProfile.email ? savedProfile.email.split('@')[0] : null) ||
                             '';

            return {
                id: decodedPayload.sub,
                userId: decodedPayload.sub,
                email: decodedPayload.email || savedProfile.email || '',
                username: decodedPayload.username || savedProfile.username || '',
                firstName: firstName,
                lastName: lastName,
                fullName: fullName,
                roles,
                isAdmin,
                exp: decodedPayload.exp
            };
        } catch (error) {
            console.error("Failed to decode token", error);
            return null;
        }
    };

    // Background fetch to load real First Name + Last Name from backend
    const fetchUserProfile = async (userId) => {
        if (!userId) return;
        try {
            const profile = await api.get(`/api/users/${userId}`);
            if (profile) {
                const fName = profile.firstName || '';
                const lName = profile.lastName || '';
                const full = (fName && lName) ? `${fName} ${lName}`.trim() : (fName || lName || profile.emailId || 'Passenger');

                setUser(prev => {
                    const updated = {
                        ...(prev || {}),
                        id: userId,
                        userId: userId,
                        firstName: fName,
                        lastName: lName,
                        fullName: full,
                        email: profile.emailId || prev?.email,
                        mobileNo: profile.mobileNo
                    };
                    localStorage.setItem('trainUserProfile', JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (err) {
            console.warn("Could not fetch user profile details:", err.message);
        }
    };

    // Toast manager
    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = 'toast-' + Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('trainToken');
        if (token) {
            const userData = decodeToken(token);
            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
                // Fetch full name from database in background
                fetchUserProfile(userData.id);
            } else {
                localStorage.removeItem('trainToken');
                localStorage.removeItem('trainRefreshToken');
                localStorage.removeItem('trainUserProfile');
                setUser(null);
                setIsAuthenticated(false);
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setLoading(false);

        // Global logout event listener from api.js
        const handleForceLogout = () => {
            localStorage.removeItem('trainToken');
            localStorage.removeItem('trainRefreshToken');
            localStorage.removeItem('trainUserProfile');
            setIsAuthenticated(false);
            setUser(null);
            showToast('Session expired. Please log in again.', 'warning');
        };

        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, [showToast]);

    const login = (accessToken, refreshToken = null, profile = null) => {
        localStorage.setItem('trainToken', accessToken);
        if (refreshToken) {
            localStorage.setItem('trainRefreshToken', refreshToken);
        }
        if (profile) {
            localStorage.setItem('trainUserProfile', JSON.stringify(profile));
        }
        const userData = decodeToken(accessToken);
        setUser(userData);
        setIsAuthenticated(true);
        if (userData?.id) {
            fetchUserProfile(userData.id);
        }
        showToast('Welcome back! Logged in successfully.', 'success');
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('trainRefreshToken');
        if (refreshToken) {
            try {
                await api.post(`/api/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`);
            } catch (err) {
                console.warn("Server-side logout notice:", err.message);
            }
        }
        localStorage.removeItem('trainToken');
        localStorage.removeItem('trainRefreshToken');
        localStorage.removeItem('trainUserProfile');
        setIsAuthenticated(false);
        setUser(null);
        showToast('Logged out successfully.', 'info');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            userId: user?.id,
            isAdmin: user?.isAdmin || false,
            login,
            logout,
            loading,
            toasts,
            showToast,
            removeToast
        }}>
            {children}
        </AuthContext.Provider>
    );
};
