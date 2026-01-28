import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';

/**
 * TermsPage - Mandatory Terms of Service for AdSense compliance
 */
const TermsPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Terms of Service - CodeShare";
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
                    Terms of Service
                </h1>
                <p className="text-gray-500 mb-8 md:mb-12 text-sm md:text-lg font-medium text-left">Last Updated: January 28, 2026</p>

                <div className="prose prose-blue max-w-none space-y-8 md:space-y-12 text-gray-700 leading-relaxed text-left">
                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">1. Agreement to Terms</h2>
                        <p className="text-sm md:text-base text-left">
                            By using CodeShare, you are agreeing to these terms. They are here to make sure the platform stays safe and useful for everyone. If you don't agree with them, please don't use the site.
                        </p>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">2. Use License</h2>
                        <p className="text-sm md:text-base text-left">
                            CodeShare provides a platform for document creation and sharing. You are granted permission to use the
                            Service for personal or professional purposes, subject to the following restrictions:
                        </p>
                        <ul className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-3 mt-4 md:mt-6 text-left text-sm md:text-base">
                            <li className="text-left">You must not use the Service for any illegal or unauthorized purpose.</li>
                            <li className="text-left">You must not transmit any worms, viruses, or any code of a destructive nature.</li>
                            <li className="text-left">You must not attempt to decompile or reverse engineer any software contained on the Service.</li>
                            <li className="text-left">You must not use the Service to host or distribute spam, phishing materials, or malware.</li>
                        </ul>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">3. User Content</h2>
                        <p className="text-sm md:text-base text-left">
                            You retain all rights to the content you create and upload to CodeShare. However, by making a document
                            public, you grant us a non-exclusive, worldwide, royalty-free license to host and display that content
                            to the public via the unique URL provided.
                        </p>
                        <p className="mt-4 text-sm md:text-base text-left">
                            You are solely responsible for the content you post. We do not pre-screen content but have the right
                            (but not the obligation) in our sole discretion to refuse or remove any content that is available via the Service.
                        </p>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">4. Account Responsibilities</h2>
                        <p className="text-sm md:text-base text-left">
                            If you create an account, you are responsible for maintaining the security of your account and
                            passwords. You are fully responsible for all activities that occur under the account and any
                            other actions taken in connection with it.
                        </p>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">5. Disclaimer</h2>
                        <p className="text-sm md:text-base text-left text-gray-600 bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 text-left italic">
                            The materials on CodeShare are provided on an 'as is' basis. We make no warranties, expressed or implied,
                            and hereby disclaim and negate all other warranties including, without limitation, implied warranties
                            or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual
                            property or other violation of rights.
                        </p>
                    </section>

                    <section className="text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">6. Limitations</h2>
                        <p className="text-sm md:text-base text-left">
                            In no event shall CodeShare or its suppliers be liable for any damages (including, without limitation,
                            damages for loss of data or profit, or due to business interruption) arising out of the use or
                            inability to use the Service.
                        </p>
                    </section>

                    <section className="pb-4 md:pb-8 text-left">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight text-left">7. Governing Law</h2>
                        <p className="text-sm md:text-base text-left">
                            These terms and conditions are governed by and construed in accordance with the laws of India.
                            Any and all disputes, claims, or legal proceedings arising out of or in connection with the Service
                            shall be subject to the exclusive jurisdiction of the courts located in Ahmedabad, Gujarat, India.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsPage;
