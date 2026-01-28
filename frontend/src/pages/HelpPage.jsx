import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/common/Footer';

/**
 * HelpPage - Help and documentation page
 * Available to both public and logged-in users
 * @param {Object} user - User object (only provided when accessed via private route)
 */
const HelpPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Help Center & Documentation - CodeShare";
  }, []);

  // Check if user is on private route
  const isPrivateRoute = location.pathname.startsWith('/p/');
  const userId = user?._id;

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
      <div className="w-full px-6 py-8 md:py-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-left mb-10 md:mb-16 px-2 md:px-4">
          <h1 className="text-3xl md:text-6xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight text-left">
            How it Works
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl text-left">
            Learn how to make the most of CodeShare. Here's everything you need to know about sharing and managing your documents.
          </p>
        </div>


        {/* Help Sections */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8 text-left">
            {/* Getting Started - Enriched */}
            <section className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-5 md:mb-6">
                <span className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-inner">🚀</span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight text-left">Getting Started</h2>
              </div>
              <div className="prose prose-blue prose-sm text-gray-600 leading-relaxed space-y-4 text-left">
                <p className="text-left">
                  CodeShare is designed to be as simple as possible. No more complicated setups or long forms.
                </p>
                <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-6">
                  <div className="bg-gray-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 text-left">
                    <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-left">1. Name Your Space</h3>
                    <p className="text-[10px] md:text-xs text-left">Enter a unique identifier in the URL. Spaces are private by default unless shared.</p>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 text-left">
                    <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-left">2. Real-time Sync</h3>
                    <p className="text-[10px] md:text-xs text-left">Once a document is named, your keystrokes are streamed to our backend using WebSockets.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Document Management - Enriched */}
            <section className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-5 md:mb-6">
                <span className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-inner">📄</span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight text-left">Document Lifecycle</h2>
              </div>
              <div className="space-y-4 md:space-y-6 text-left">
                <div className="flex gap-4">
                  <div className="mt-1 w-5 h-5 md:w-6 md:h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                  <p className="text-gray-600 text-xs md:text-sm text-left">
                    <strong>Persistence Layers:</strong> Documents are stored with version-controlled history, allowing you to roll back to any previous state easily.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                  <p className="text-gray-600 text-xs md:text-sm text-left">
                    <strong>Slug Customization:</strong> Professional users can customize their document URLs for easier branding and teamwork sessions.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 w-5 h-5 md:w-6 md:h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                  <p className="text-gray-600 text-xs md:text-sm text-left">
                    <strong>Permissions:</strong> Choose if you want your document to be public, read-only, or fully collaborative.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ - Enriched */}
            <section className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <span className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-inner">❓</span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight text-left">Technical FAQ</h2>
              </div>
              <div className="space-y-4 md:space-y-6 text-left">
                <details className="group border-b border-gray-100 pb-3 md:pb-4 outline-none">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm md:text-base text-left">Is CodeShare built for production code?</h3>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="text-xs md:text-sm text-gray-500 mt-2 md:mt-3 leading-relaxed text-left">
                    Yes. CodeShare utilizes an editor engine optimized for high-performance text injection, making it suitable for rapid documentation and workshops.
                  </p>
                </details>
                <details className="group border-b border-gray-100 pb-3 md:pb-4 outline-none">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm md:text-base text-left">How does the auto-save handle latency?</h3>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="text-xs md:text-sm text-gray-500 mt-2 md:mt-3 leading-relaxed text-left">
                    Our engine uses an optimistic update approach. Local changes are rendered instantly while the sync layer handles background persistence.
                  </p>
                </details>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6 md:space-y-8 text-left">
            {/* Contact Support */}
            <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
              <h2 className="text-xl md:text-2xl font-black mb-3 md:mb-4 relative z-10 text-left">Advanced Assistance</h2>
              <p className="mb-6 md:mb-8 font-medium opacity-80 text-[12px] md:text-sm leading-relaxed relative z-10 text-left">
                Facing a problem? I'm here to help with deployment, API questions, or anything else you need.
              </p>
              <div className="space-y-3 md:space-y-4 relative z-10 text-left">
                <a
                  href="mailto:developer.codeshare@gmail.com"
                  className="block w-full text-center py-2.5 md:py-3 bg-white text-blue-600 rounded-lg md:rounded-xl font-bold hover:scale-[1.02] transition shadow-md text-[12px] md:text-sm"
                >
                  Contact Engineering
                </a>
                <button
                  onClick={() => navigate(isPrivateRoute && userId ? `/p/${userId}/about` : '/about')}
                  className="block w-full text-center py-2.5 md:py-3 bg-blue-500 border border-blue-400 rounded-lg md:rounded-xl font-bold hover:bg-blue-400 transition text-[12px] md:text-sm"
                >
                  Platform Specs
                </button>
              </div>
            </section>

            {/* Quick Tips */}
            <section className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100 text-left">
              <h3 className="font-black text-gray-900 mb-4 md:mb-6 uppercase tracking-wider text-[10px] md:text-xs text-left">Collaboration Pro-Tips</h3>
              <ul className="space-y-3 md:space-y-4 text-left">
                <li className="flex gap-3 text-left">
                  <span className="text-blue-500 font-bold shrink-0">💡</span>
                  <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed text-left">Use <strong>Ctrl + B</strong> for rapid bolding of critical snippets during live sessions.</p>
                </li>
                <li className="flex gap-3 text-left">
                  <span className="text-indigo-500 font-bold shrink-0">💡</span>
                  <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed text-left">Shared links are permanent unless manually removed from your workspace.</p>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer user={user} />
    </div>
  );
};

export default HelpPage;

