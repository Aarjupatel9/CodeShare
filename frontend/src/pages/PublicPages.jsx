import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainPage from './MainPage';
import Footer from '../components/common/Footer';

export default function PublicPages() {
    const { slug } = useParams();

    useEffect(() => {
        if (slug) {
            // Capitalize first letter of slug for title if possible, or just use as is
            const displaySlug = slug.charAt(0).toUpperCase() + slug.slice(1);
            document.title = `${displaySlug} - CodeShare`;
        } else {
            document.title = "CodeShare - Free Collaborative Document Editor & Code Sharing";
        }
    }, [slug]);

    return (
        <div className="w-full min-h-screen flex flex-col">
            {/* AdSlot - To be enabled after Google verification */}
            {/* <div className="w-full max-w-4xl mx-auto mt-4 px-2">
                <AdSlot />
            </div> */}

            <div className="w-full min-h-screen">
                <MainPage user={null} />
            </div>

            {/* SEO & AdSense Optimization Content Section */}
            <div className="w-full max-w-7xl mx-auto my-12 px-6">
                <div className="w-full max-w-4xl mx-auto pb-12 border-t border-gray-100 pt-12">
                    <div className="grid md:grid-cols-2 gap-12 text-left">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Built for Speed</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                CodeShare is a lightweight, real-time platform for developers and writers who need to share notes, code, and documentation instantly.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Our tech is built to be fast. We use modern WebSockets to make sure everything stayed in sync while you type, with zero lag. No installation, no accounts—just create and share.
                            </p>
                        </div>
                        <div className="space-y-8">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight">🚀 Fast Sharing</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">No complex setups. Just click a link, type, and send the URL to others.</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight">🔒 Secure by Design</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">Industry-standard encryption and secure isolated namespaces protect your data at rest and in transit.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AdSlot - To be enabled after Google verification */}
            {/* <div className="w-full max-w-4xl mx-auto my-6 px-2">
                <AdSlot />
            </div> */}

            <Footer />
        </div>
    );
}
