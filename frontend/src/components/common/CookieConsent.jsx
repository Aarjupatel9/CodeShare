import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * CookieConsent - Sticky banner for GDPR/AdSense compliance
 */
const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent-granted');
        if (!consent) {
            // Small delay for better entry animation feel
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent-granted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-700">
            <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.1)] rounded-2xl md:rounded-[28px] p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                        <span className="text-xl md:text-2xl">🍪</span>
                        <h3 className="font-black text-gray-900 tracking-tight text-sm md:text-lg">Cookie Transparency</h3>
                    </div>
                    <p className="text-[11px] md:text-sm text-gray-600 leading-relaxed text-left">
                        CodeShare uses cookies to make CodeShare work better and to show relevant content.
                        By using the site, you're cool with our
                        <Link to="/legal/privacy" className="text-blue-600 font-bold hover:underline mx-1">Privacy Policy</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-6 md:px-10 py-2.5 md:py-3.5 bg-blue-600 text-white text-xs md:text-sm font-black rounded-xl md:rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        I Accept
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="px-4 py-2.5 md:py-3.5 bg-gray-50 text-gray-400 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl hover:bg-gray-100 transition-all"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
