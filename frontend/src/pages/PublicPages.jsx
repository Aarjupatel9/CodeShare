import React from 'react';
import MainPage from './MainPage';
import AdSlot from '../components/ads/AdSlot';

export default function PublicPages() {
    return (
        <div className="w-full h-full flex flex-col">
            {/* AdSlot - To be enabled after Google verification */}
            {/* <div className="w-full max-w-4xl mx-auto mt-4 px-2">
                <AdSlot />
            </div> */}

            <div className="w-full h-full flex-shrink-0">
                <MainPage user={null} />
            </div>

            {/* SEO & AdSense Optimization Content Section */}
            <div className="w-full max-w-4xl mx-auto my-12 px-4 pb-12 border-t border-gray-100 pt-12">
                {/* ... existing content ... */}
                <div className="grid md:grid-cols-2 gap-12 text-left">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What is CodeShare?</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            CodeShare is a free, high-performance web platform designed for developers, educators, and teams who need a fast way to share documentation, code snippets, and rich-text notes.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Built with a focus on speed and simplicity, CodeShare provides an instant, real-time editing environment where changes are saved automatically. Whether you're debugging with a colleague or sharing a permanent tutorial, CodeShare ensures your content is rendered beautifully and accessible via a unique, customizable URL.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Instant Deployment</h3>
                            <p className="text-sm text-gray-600">No setup required. Create a document, give it a name, and start sharing instantly with the world.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">🔒 Secure & Reliable</h3>
                            <p className="text-sm text-gray-600">Your data is hosted on secure cloud infrastructure with real-time backups, ensuring your work is never lost.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AdSlot - To be enabled after Google verification */}
            {/* <div className="w-full max-w-4xl mx-auto my-6 px-2">
                <AdSlot />
            </div> */}
        </div>
    );
}
