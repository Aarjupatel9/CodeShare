import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';

/**
 * PrivacyPage - Mandatory Privacy Policy for AdSense compliance
 */
const PrivacyPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Privacy Policy - CodeShare";
    }, []);

    return (
        <div className="min-w-full min-h-screen bg-white">
            {/* Simple Header */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div
                        onClick={() => navigate('/')}
                        className="text-2xl font-black text-blue-600 cursor-pointer tracking-tight"
                    >
                        CodeShare
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition flex items-center gap-1"
                    >
                        <span className="text-lg">←</span> Back
                    </button>
                </div>
            </nav>

            {/* Content */}
            <main className="w-full max-w-4xl mx-auto px-6 py-8 md:py-16 text-left">
                <h1 className="text-2xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight text-left">
                    Privacy Policy
                </h1>
                <p className="text-gray-500 mb-8 md:mb-12 text-sm md:text-lg font-medium text-left">Last Updated: January 28, 2026</p>

                <div className="prose prose-blue max-w-none space-y-8 md:space-y-12 text-gray-700 leading-relaxed text-left">
                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">1. Our Commitment</h2>
                        <p className="text-sm md:text-base text-left">
                            I value your privacy as much as my own. This policy explains what data is collected when you use CodeShare and how it's handled. My goal is to be as transparent as possible about the information needed to keep the service running.
                        </p>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">2. The Data We Collect</h2>
                        <p className="text-sm md:text-base text-left">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-3 mt-4 md:mt-6 text-left">
                            <li className="text-left"><strong>Identity Data:</strong> Includes username or similar identifier when you create an account.</li>
                            <li className="text-left"><strong>Contact Data:</strong> Includes email address.</li>
                            <li className="text-left"><strong>Technical Data:</strong> Includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                            <li className="text-left"><strong>Usage Data:</strong> Includes information about how you use our website, products and services (e.g., documents created).</li>
                        </ul>
                    </section>

                    <section id="cookies" className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">3. Cookies & Advertising</h2>
                        <p className="text-sm md:text-base text-left">
                            We use cookies to distinguish you from other users of our website. This helps us to provide you with a good
                            experience when you browse our website and also allows us to improve our site.
                        </p>
                        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 mt-6 md:mt-8 text-left">
                            <h3 className="font-bold text-gray-900 mb-2 md:mb-3 uppercase tracking-widest text-[10px] md:text-xs text-left">Google AdSense Disclosure</h3>
                            <p className="text-gray-600 text-[12px] md:text-sm leading-relaxed text-left">
                                Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the advertising
                                cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or
                                other sites on the Internet. Users may opt out of personalized advertising by visiting
                                <a href="https://www.google.com/settings/ads" className="underline ml-1 font-bold text-blue-600">Ads Settings</a>.
                            </p>
                        </div>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">4. How We Use Your Data</h2>
                        <p className="text-sm md:text-base text-left">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data
                            in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-3 mt-4 md:mt-6 text-left">
                            <li className="text-left">To register you as a new customer.</li>
                            <li className="text-left">To manage our relationship with you.</li>
                            <li className="text-left">To provide the document sharing and collaboration services.</li>
                            <li className="text-left">To improve our website, services, and user experience.</li>
                            <li className="text-left">To deliver relevant website content and advertisements to you.</li>
                        </ul>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">5. Data Security</h2>
                        <p className="text-sm md:text-base text-left">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                            used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal
                            data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section className="pb-4 md:pb-8 text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">6. Your Legal Rights</h2>
                        <p className="text-sm md:text-base text-left">
                            Under certain circumstances, you have rights under data protection laws in relation to your personal data,
                            including the right to request access, correction, erasure, restriction, transfer, or to object to processing.
                            If you wish to exercise any of these rights, please contact us at <span className="font-bold text-left">developer.codeshare@gmail.com</span>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;
