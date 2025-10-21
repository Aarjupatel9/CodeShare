import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * HelpPage - Help and documentation page
 * Available to both public and logged-in users
 * @param {Object} user - User object (only provided when accessed via private route)
 */
const HelpPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is on private route
  const isPrivateRoute = location.pathname.startsWith('/p/');
  const userId = user?._id;

  return (
    <div className="min-w-full min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition"
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

      {/* Main Content */}
      <div className="w-full px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about using CodeShare
          </p>
        </div>

        {/* Help Sections */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Getting Started */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p><strong>Create an Account:</strong> Sign up for free to start creating and sharing documents.</p>
              <p><strong>Create Documents:</strong> Click "New Document" to create a new page with our rich text editor.</p>
              <p><strong>Share Your Work:</strong> Every document gets a unique URL you can share with anyone.</p>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h2 className="text-2xl font-bold text-gray-900">Features</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>📝</span> Rich Text Editor
                </h3>
                <p className="text-sm text-gray-600">Format text, add images, code blocks, and more with our powerful editor.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>📎</span> File Attachments
                </h3>
                <p className="text-sm text-gray-600">Upload and attach files to your documents for easy sharing.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>🔗</span> Public Sharing
                </h3>
                <p className="text-sm text-gray-600">Share documents publicly with a simple URL - no login required.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>🏏</span> Auctions
                </h3>
                <p className="text-sm text-gray-600">Manage sports auctions with team management and bidding features.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>🎮</span> Games
                </h3>
                <p className="text-sm text-gray-600">Play interactive games directly in your browser.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>📱</span> Mobile Friendly
                </h3>
                <p className="text-sm text-gray-600">Access your documents from any device - fully responsive design.</p>
              </div>
            </div>
          </section>

          {/* Document Management */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📄</span>
              <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Creating Documents</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Click "New Document" from the sidebar or profile menu</li>
                  <li>Enter a unique name for your document</li>
                  <li>Start editing with the rich text editor</li>
                  <li>Your work is automatically saved</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Managing Documents</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>View all your documents in the sidebar under "Pages"</li>
                  <li>Click on any document to open and edit it</li>
                  <li>Delete documents by clicking the remove icon</li>
                  <li>Share the document URL to make it publicly accessible</li>
                </ul>
              </div>
            </div>
          </section>

          {/* File Uploads */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📎</span>
              <h2 className="text-2xl font-bold text-gray-900">File Uploads</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p><strong>Upload Files:</strong> Switch to the "Files" tab in the sidebar and click "Upload File".</p>
              <p><strong>Download Files:</strong> Click the download button on any uploaded file.</p>
              <p><strong>Delete Files:</strong> Remove files you no longer need with the delete button.</p>
              <p><strong>File Types:</strong> Upload any file type - documents, images, videos, archives, and more.</p>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⌨️</span>
              <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Bold text</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">Ctrl + B</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Italic text</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">Ctrl + I</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Underline</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">Ctrl + U</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Save (auto-save enabled)</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">Ctrl + S</kbd>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">❓</span>
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Is CodeShare free to use?</h3>
                <p className="text-sm text-gray-600">Yes! CodeShare is completely free for personal use.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Are my documents private?</h3>
                <p className="text-sm text-gray-600">Documents are accessible via URL. Only people with the link can view them.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Can I collaborate with others?</h3>
                <p className="text-sm text-gray-600">Currently, you can share read-only links. Real-time collaboration is coming soon!</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What file size limits exist?</h3>
                <p className="text-sm text-gray-600">File uploads are limited to reasonable sizes to ensure fast performance for all users.</p>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
              <p className="mb-6 text-blue-100">We're here to assist you with any questions or issues.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate(isPrivateRoute && userId ? `/p/${userId}/about` : '/about')}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
                >
                  About CodeShare
                </button>
                <a
                  href="mailto:support@codeshare.com"
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-400 rounded-lg font-semibold transition shadow-md"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="px-6 text-center text-sm text-gray-600">
          <p>© 2025 CodeShare. Made with ❤️ for the community.</p>
        </div>
      </footer>
    </div>
  );
};

export default HelpPage;

