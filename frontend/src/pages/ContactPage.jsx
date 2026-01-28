import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/common/Footer';

/**
 * ContactPage - Dedicated contact page for user inquiries and support
 * @param {Object} user - User object (only provided when accessed via private route)
 */
const ContactPage = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user is on private route
    const isPrivateRoute = location.pathname.startsWith('/p/');
    const userId = user?._id;

    useEffect(() => {
        document.title = "Contact Us - CodeShare Engineering Support";
    }, []);

    return (
        <div className="min-w-full min-h-screen bg-slate-50">
            {/* Header */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div
                        onClick={() => navigate('/')}
                        className="text-2xl font-black text-blue-600 cursor-pointer tracking-tight"
                    >
                        CodeShare
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-full border border-gray-200 transition-all shadow-sm"
                    >
                        ← Back
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full px-6 py-8 md:py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-left mb-10 md:mb-16">
                        <h1 className="text-3xl md:text-6xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight text-left">
                            Get in Touch
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl text-left">
                            Have a question about CodeShare? Our engineering team is here to help you with platform support, API integrations, and technical inquiries.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        {/* Contact Information */}
                        <div className="space-y-6 md:space-y-8 text-left">
                            <section className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100 h-full">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-inner">✉️</div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 tracking-tight text-left">Direct Support</h2>
                                <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base text-left">
                                    For help with technical issues, bug reports, or feature ideas, please reach out to me directly.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest text-left">Email Address</p>
                                    <a
                                        href="mailto:developer.codeshare@gmail.com"
                                        className="text-lg md:text-xl font-black text-blue-600 hover:text-blue-700 transition break-all"
                                    >
                                        developer.codeshare@gmail.com
                                    </a>
                                </div>
                            </section>
                        </div>

                        {/* Quick Assist */}
                        <div className="space-y-6 md:space-y-8 text-left">
                            <section className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100 h-full">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-inner">⚡</div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 tracking-tight text-left">Fast Resolution</h2>
                                <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base text-left">
                                    For immediate self-help, check our Knowledge Base.
                                </p>
                                <button
                                    onClick={() => navigate(isPrivateRoute && userId ? `/p/${userId}/help` : '/help')}
                                    className="w-full py-3 md:py-4 bg-gray-900 text-white rounded-xl md:rounded-2xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 group"
                                >
                                    Visit Help Center
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </section>
                        </div>
                    </div>

                    {/* Social/Community Section */}
                    <section className="mt-8 md:mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl md:rounded-[32px] p-8 md:p-12 text-white overflow-hidden relative shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10 text-left">
                            <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-6 tracking-tight text-left">Platform Status & Updates</h2>
                            <p className="text-blue-100 mb-8 max-w-xl text-sm md:text-lg opacity-90 leading-relaxed text-left">
                                Follow our official channels for real-time uptime monitoring, scheduled maintenance announcements, and the latest feature releases.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-xs md:text-sm font-bold">
                                    Uptime: <span className="text-green-300">99.9%</span>
                                </div>
                                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-xs md:text-sm font-bold">
                                    Response Time: <span className="text-blue-200">&lt;10ms</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer user={user} />
        </div>
    );
};

export default ContactPage;
