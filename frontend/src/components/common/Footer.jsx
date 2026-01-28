import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

/**
 * Footer - Global footer component for CodeShare
 * Includes mandatory legal links for AdSense compliance
 */
const Footer = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isPrivateRoute = location.pathname.startsWith('/p/');
    const userId = user?._id;

    const navigateTo = (path) => {
        if (isPrivateRoute && userId) {
            // If we're on a private route, try to maintain the session context if applicable
            // For help/about, we use the /p/:userId/ paths
            if (path === '/help') navigate(`/p/${userId}/help`);
            else if (path === '/about') navigate(`/p/${userId}/about`);
            else if (path === '/contact') navigate(`/p/${userId}/contact`);
            else navigate(path);
        } else {
            navigate(path);
        }
    };

    return (
        <footer className="bg-white border-t border-gray-200 py-8 md:py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 text-left">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <h3
                            onClick={() => navigate('/')}
                            className="text-lg md:text-xl font-black text-blue-600 mb-3 md:mb-4 cursor-pointer hover:text-blue-700 transition"
                        >
                            CodeShare
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                            The high-performance platform for real-time document sharing and collaborative coding. Built for developers, trusted by teams.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div className="flex flex-col items-start">
                        <h4 className="font-bold text-gray-900 mb-3 md:mb-4 font-sans uppercase tracking-wider text-[10px] md:text-xs">Platform</h4>
                        <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600">
                            <li><button onClick={() => navigateTo('/help')} className="hover:text-blue-600 transition">Help Center</button></li>
                            <li><button onClick={() => navigateTo('/about')} className="hover:text-blue-600 transition">About Us</button></li>
                            <li><button onClick={() => navigateTo('/contact')} className="hover:text-blue-600 transition">Contact Support</button></li>
                            <li><button onClick={() => navigate('/games')} className="hover:text-blue-600 transition">Interactive Games</button></li>
                            <li><a href="https://auctionng.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Sports Auctions</a></li>
                        </ul>
                    </div>

                    {/* Legal Links - Critical for AdSense */}
                    <div className="flex flex-col items-start">
                        <h4 className="font-bold text-gray-900 mb-3 md:mb-4 font-sans uppercase tracking-wider text-[10px] md:text-xs">Legal</h4>
                        <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600">
                            <li><button onClick={() => navigate('/legal/privacy')} className="hover:text-blue-600 transition">Privacy Policy</button></li>
                            <li><button onClick={() => navigate('/legal/terms')} className="hover:text-blue-600 transition">Terms of Service</button></li>
                            <li><button onClick={() => navigate('/legal/privacy#cookies')} className="hover:text-blue-600 transition">Cookie Policy</button></li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div className="flex flex-col items-start">
                        <h4 className="font-bold text-gray-900 mb-3 md:mb-4 font-sans uppercase tracking-wider text-[10px] md:text-xs">Contact</h4>
                        <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <span className="text-gray-400">📧</span>
                                <a href="mailto:developer.codeshare@gmail.com" className="hover:text-blue-600 transition lowercase">developer.codeshare@gmail.com</a>
                            </li>
                            <li className="text-[10px] md:text-xs text-gray-400 pt-2 italic">
                                Made with ❤️ for the global developer community.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 text-center md:text-left">
                    <p className="text-xs md:text-sm text-gray-500">
                        © {new Date().getFullYear()} CodeShare Platform. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] md:text-xs text-gray-400">v{process.env.REACT_APP_VERSION || '1.2.0'}</span>
                        <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition cursor-help" title="Part of the AuctionNG Network">
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-500">By</span>
                            <span className="text-sm font-black text-blue-900">AuctionNG</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
