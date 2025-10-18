import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AboutPage - About/web details page
 * Information about CodeShare platform
 */
const AboutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is on private route
  const isPrivateRoute = location.pathname.startsWith('/p/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition"
          >
            CodeShare
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About CodeShare
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
            A modern platform for creating, sharing, and collaborating on documents and more
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Mission */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              CodeShare is built to make document creation and sharing effortless. We believe in 
              providing powerful tools that are simple to use, accessible to everyone, and free 
              from unnecessary complexity. Whether you're sharing notes, code snippets, documentation, 
              or running auctions, CodeShare has you covered.
            </p>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌟</span>
              <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Document Editor
                </h3>
                <p className="text-sm text-gray-700">
                  Rich text editing with support for formatting, images, code blocks, and more. 
                  Create beautiful documents with ease.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔗</span>
                  Easy Sharing
                </h3>
                <p className="text-sm text-gray-700">
                  Every document gets a unique URL. Share it with anyone - no account required 
                  to view shared documents.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">📎</span>
                  File Management
                </h3>
                <p className="text-sm text-gray-700">
                  Upload and manage files alongside your documents. Keep everything organized 
                  in one place.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🏏</span>
                  Auction Platform
                </h3>
                <p className="text-sm text-gray-700">
                  Manage sports auctions with team creation, player bidding, and live updates. 
                  Perfect for fantasy leagues.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  Interactive Games
                </h3>
                <p className="text-sm text-gray-700">
                  Play games directly in your browser. More games and features being added 
                  regularly.
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Responsive Design
                </h3>
                <p className="text-sm text-gray-700">
                  Works seamlessly on desktop, tablet, and mobile. Access your content from 
                  any device, anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⚙️</span>
              <h2 className="text-3xl font-bold text-gray-900">Technology</h2>
            </div>
            <p className="text-gray-700 mb-4">
              CodeShare is built with modern web technologies to ensure speed, reliability, and a great user experience:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-4xl mb-2">⚛️</div>
                <h3 className="font-bold text-gray-900">React</h3>
                <p className="text-xs text-gray-600">Modern UI framework</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-4xl mb-2">🟢</div>
                <h3 className="font-bold text-gray-900">Node.js</h3>
                <p className="text-xs text-gray-600">Fast backend server</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-4xl mb-2">🍃</div>
                <h3 className="font-bold text-gray-900">MongoDB</h3>
                <p className="text-xs text-gray-600">Flexible database</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-4xl mb-2">🎨</div>
                <h3 className="font-bold text-gray-900">Tailwind CSS</h3>
                <p className="text-xs text-gray-600">Beautiful styling</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                <div className="text-4xl mb-2">🔌</div>
                <h3 className="font-bold text-gray-900">WebSockets</h3>
                <p className="text-xs text-gray-600">Real-time updates</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <div className="text-4xl mb-2">📝</div>
                <h3 className="font-bold text-gray-900">TinyMCE</h3>
                <p className="text-xs text-gray-600">Rich text editor</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✨</span>
              <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">No Installation Required</h3>
                  <p className="text-sm text-gray-600">Everything works in your browser - no software to download or install.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Auto-Save</h3>
                  <p className="text-sm text-gray-600">Your work is automatically saved as you type - never lose your progress.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Public & Private Access</h3>
                  <p className="text-sm text-gray-600">Create documents for yourself or share them publicly with unique URLs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile Optimized</h3>
                  <p className="text-sm text-gray-600">Fully responsive design works perfectly on phones, tablets, and desktops.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Free to Use</h3>
                  <p className="text-sm text-gray-600">Core features are completely free - no hidden costs or subscriptions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔒</span>
              <h2 className="text-3xl font-bold text-gray-900">Privacy & Security</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Your data is important to us.</strong> We take security seriously and implement 
                industry-standard practices to protect your information.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Secure authentication with encrypted passwords</li>
                <li>HTTPS encryption for all data transmission</li>
                <li>Regular security updates and monitoring</li>
                <li>Your documents are private unless you choose to share them</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Get Started CTA */}
        <section>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Join thousands of users who trust CodeShare for their document needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/auth/register')}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-md text-lg"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => navigate(isPrivateRoute ? '/p/help' : '/help')}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-400 rounded-lg font-bold transition shadow-md text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">CodeShare</h3>
              <p className="text-sm text-gray-600">
                Modern document sharing and collaboration platform.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/" className="hover:text-blue-600 transition">Home</a></li>
                <li><a href={isPrivateRoute ? "/p/help" : "/help"} className="hover:text-blue-600 transition">Help</a></li>
                <li><a href="/games" className="hover:text-blue-600 transition">Games</a></li>
                <li><a href="/t/auction" className="hover:text-blue-600 transition">Auctions</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: support@codeshare.com</li>
                <li>Made with ❤️ for the community</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p>© 2025 CodeShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;

