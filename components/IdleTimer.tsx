import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const IdleTimer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 5 minutes in milliseconds
    const IDLE_TIMEOUT = 5 * 60 * 1000;

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Do not redirect if already on AFK or Admin pages
        if (location.pathname === '/afk' || location.pathname.startsWith('/admin')) {
            return;
        }

        timeoutRef.current = setTimeout(() => {
            navigate('/afk');
        }, IDLE_TIMEOUT);
    };

    useEffect(() => {
        // Initial setup
        resetTimer();

        // Events that reset the idle timer
        const events = [
            'mousemove',
            'keydown',
            'wheel',
            'DOMMouseScroll',
            'mouseWheel',
            'mousedown',
            'touchstart',
            'touchmove',
            'MSPointerDown',
            'MSPointerMove'
        ];

        const handleActivity = () => resetTimer();

        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [location.pathname, navigate]);

    return null; // This component doesn't render anything visually
};

export default IdleTimer;
