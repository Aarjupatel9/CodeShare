import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/common/Footer';

/**
 * AboutPage - About/web details page
 * Information about CodeShare platform
 * @param {Object} user - User object (only provided when accessed via private route)
 */
const AboutPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "About CodeShare - Instant Document Collaboration";
  }, []);

  // Check if user is on private route
  const isPrivateRoute = location.pathname.startsWith('/p/');
  const userId = user?._id;

  return (
    <div className="min-w-full min-h-screen bg-white">
      {/* Premium Header */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-black text-blue-600 cursor-pointer tracking-tight flex items-center gap-2"
          >
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">C</span>
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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 text-white overflow-hidden py-16 md:py-24">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-400/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-blue-500/30 backdrop-blur-md rounded-full text-blue-100 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 md:mb-6">
            Global Collaboration Platform
          </span>
          <h1 className="text-3xl md:text-7xl font-black mb-6 md:mb-8 tracking-tight leading-tight">
            The Fastest Way to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">Share Your Work</span>
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto font-medium opacity-90 leading-relaxed px-4">
            CodeShare is a simple, high-performance tool built for people who want to share code and documents without unnecessary steps.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-12 md:py-20 bg-white">
        {/* Mission - Enriched for AdSense */}
        <section className="max-w-6xl mx-auto px-6 mb-20 md:mb-32">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="text-left">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl mb-5 md:mb-6 shadow-inner">🎯</div>
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight text-left">Why I Built This</h2>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-5 md:mb-6 text-left">
                Most document tools today are too slow or require too many accounts. CodeShare was built on a simple idea: sharing should be as fast as thinking. I wanted to create a space where you can just name a link and start working instantly.
              </p>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed text-left">
                Whether you're sharing a quick code snippet or writing a full tutorial, this platform gives you a clean, distraction-free environment that syncs across the world in real-time.
              </p>
            </div>
            <div className="bg-gray-50 rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-gray-100 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 group-hover:scale-150 transition-transform duration-700 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 space-y-4 md:space-y-6 text-left">
                <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
                  <div className="text-blue-600 font-black text-2xl md:text-3xl mb-1">10ms</div>
                  <div className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest text-left">Global Latency</div>
                </div>
                <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
                  <div className="text-indigo-600 font-black text-2xl md:text-3xl mb-1">99.9%</div>
                  <div className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest text-left">Uptime Reliability</div>
                </div>
                <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
                  <div className="text-purple-600 font-black text-2xl md:text-3xl mb-1">Free</div>
                  <div className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest text-left">Forever for Individuals</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-40 text-left">
          <div className="mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight text-left">Ecosystem of Tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 p-6 md:p-8 bg-blue-50 rounded-3xl md:rounded-[32px] border border-blue-100 group hover:bg-blue-600 transition-all duration-500">
              <span className="text-3xl md:text-4xl mb-4 md:mb-6 block group-hover:scale-[102%] transition-transform">📝</span>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 md:mb-4 group-hover:text-white transition-colors">Real-Time Editor</h3>
              <p className="text-sm md:text-lg text-gray-600 group-hover:text-blue-50 transition-colors leading-relaxed">
                Our editor is built to be fast. It handles everything from formatted text to code snippets flawlessly, saving every single keystroke as you type.
              </p>
            </div>
            <div className="p-6 md:p-8 bg-indigo-50 rounded-3xl md:rounded-[32px] border border-indigo-100 group hover:bg-indigo-600 transition-all duration-500">
              <span className="text-3xl md:text-4xl mb-4 md:mb-6 block group-hover:scale-[102%] transition-transform">🔗</span>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 group-hover:text-white transition-colors">Simple Links</h3>
              <p className="text-sm md:text-lg text-gray-600 group-hover:text-indigo-50 transition-colors leading-relaxed">
                No accounts or sign-ups required. Just pick a unique URL and send it to whoever you're working with.
              </p>
            </div>
            <div className="p-6 md:p-8 bg-green-50 rounded-3xl md:rounded-[32px] border border-green-100 group hover:bg-green-600 transition-all duration-500">
              <span className="text-3xl md:text-4xl mb-4 md:mb-6 block group-hover:scale-[102%] transition-transform">🏏</span>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 group-hover:text-white transition-colors">Auction Tools</h3>
              <p className="text-sm md:text-lg text-gray-600 group-hover:text-green-50 transition-colors leading-relaxed">
                The platform also includes specialized tools for real-time sports auctions and team management.
              </p>
            </div>
            <div className="md:col-span-2 p-6 md:p-8 bg-purple-50 rounded-3xl md:rounded-[32px] border border-purple-100 group hover:bg-purple-600 transition-all duration-500">
              <span className="text-3xl md:text-4xl mb-4 md:mb-6 block group-hover:scale-[102%] transition-transform">⚙️</span>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 md:mb-4 group-hover:text-white transition-colors">Rock Solid Tech</h3>
              <p className="text-sm md:text-lg text-gray-600 group-hover:text-purple-50 transition-colors leading-relaxed">
                Built with modern tech like React 18 and WebSockets to make sure your data is always in sync without any lag.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy & Security - Enriched */}
        <section className="max-w-4xl mx-auto px-6 mb-24 md:mb-40 text-left">
          <div className="bg-gray-900 text-white rounded-[32px] md:rounded-[48px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="relative z-10">
              <div className="text-3xl md:text-4xl mb-6 md:mb-8 text-left">🔒</div>
              <h2 className="text-2xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight text-left">Enterprise-Grade Security</h2>
              <div className="space-y-4 md:space-y-6 text-gray-400 text-base md:text-lg leading-relaxed text-left">
                <p>
                  I've built CodeShare with security in mind from day one. Every piece of your data is encrypted using industry-standard AES-256 via TLS 1.3.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-10">
                  <div className="flex items-start gap-3 md:gap-4">
                    <span className="text-blue-500 mt-1 font-bold">✓</span>
                    <p className="text-[12px] md:text-sm">Salted & Hashed Passwords using Argon2id</p>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <span className="text-indigo-500 mt-1 font-bold">✓</span>
                    <p className="text-[12px] md:text-sm">Granular Access Control Lists (ACL)</p>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <span className="text-purple-500 mt-1 font-bold">✓</span>
                    <p className="text-[12px] md:text-sm">Real-time Threat Monitoring</p>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <span className="text-pink-500 mt-1 font-bold">✓</span>
                    <p className="text-[12px] md:text-sm">DDoS Protection via Edge Gateway</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-4 md:pb-12 text-left">
          <div className="bg-blue-600 rounded-3xl md:rounded-[40px] p-8 md:p-16 text-white text-left shadow-xl flex flex-col items-start">
            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight text-left">Ready to build?</h2>
            <p className="text-blue-100 mb-8 md:mb-10 text-lg md:text-xl font-medium opacity-90 max-w-2xl text-left">
              Join a community of makers who value speed, efficiency, and elegant sharing.
            </p>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <button
                onClick={() => navigate('/auth/register')}
                className="px-8 py-3 md:px-10 md:py-4 bg-white text-blue-600 rounded-xl md:rounded-2xl font-black hover:scale-105 transition shadow-lg text-base md:text-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate(isPrivateRoute && userId ? `/p/${userId}/help` : '/help')}
                className="px-8 py-3 md:px-10 md:py-4 bg-blue-500 border border-blue-400 rounded-xl md:rounded-2xl font-black hover:bg-blue-400 transition text-base md:text-lg"
              >
                Read Docs
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer user={user} />
    </div>
  );
};

export default AboutPage;

