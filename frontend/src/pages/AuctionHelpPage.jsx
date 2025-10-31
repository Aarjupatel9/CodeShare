import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuctionHelpPage - Auction-specific help and documentation
 * Available to both public and logged-in users
 */
const AuctionHelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full min-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition"
          >
            CodeShare
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🏏 Auction Management Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete guide to managing sports auctions, teams, players, and live bidding
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <a href="#getting-started" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-3xl mb-2">🚀</div>
            <div className="font-semibold text-gray-900">Getting Started</div>
            <div className="text-xs text-gray-600 mt-1">Create your first auction</div>
          </a>
          <a href="#teams-players" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-semibold text-gray-900">Teams & Players</div>
            <div className="text-xs text-gray-600 mt-1">Manage your auction data</div>
          </a>
          <a href="#live-bidding" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900">Live Bidding</div>
            <div className="text-xs text-gray-600 mt-1">Run auction sessions</div>
          </a>
          <a href="#live-view" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center border border-gray-100">
            <div className="text-3xl mb-2">📺</div>
            <div className="font-semibold text-gray-900">Live View</div>
            <div className="text-xs text-gray-600 mt-1">Public spectator page</div>
          </a>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Getting Started */}
          <section id="getting-started" className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🚀</span>
              <h2 className="text-3xl font-bold text-gray-900">Getting Started</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">1️⃣</span> Create a New Auction
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-6">
                  <li>Go to the Auctions page from your profile</li>
                  <li>Click "Create New Auction" button</li>
                  <li>Enter auction details (name, password, budget, max players, etc.)</li>
                  <li>Set the auction settings and preferences</li>
                  <li>Click "Create Auction" to start</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">2️⃣</span> Configure Auction Settings
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-6">
                  <li><strong>Auction Name:</strong> Give your auction a descriptive name</li>
                  <li><strong>Password:</strong> Protect your auction with a password</li>
                  <li><strong>Total Budget:</strong> Set the spending limit for teams</li>
                  <li><strong>Max Team Members:</strong> Define how many players each team can have</li>
                  <li><strong>Live View:</strong> Toggle to enable/disable public spectator page</li>
                  <li><strong>Viewer Analytics:</strong> Track live viewer count and engagement</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Teams & Players */}
          <section id="teams-players" className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">👥</span>
              <h2 className="text-3xl font-bold text-gray-900">Teams & Players Management</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎨</span> Adding Teams
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                  <li><strong>Manual Entry:</strong> Click "Add Team Manually" and enter team details</li>
                  <li><strong>Team Name:</strong> Choose a unique name for each team</li>
                  <li><strong>Team Owner:</strong> Optional - specify the team owner/manager</li>
                  <li><strong>Budget:</strong> Set the team's spending limit</li>
                  <li><strong>Logo Upload:</strong> Click the team logo area to upload a team logo (jpeg, png, webp under 500KB)</li>
                  <li><strong>Edit/Delete:</strong> Use the edit and delete buttons to manage teams</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">👤</span> Adding Players
                </h3>
                <p className="text-sm mb-2">There are two ways to add players:</p>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    📄 Method 1: Excel Upload (Recommended)
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-900 ml-4">
                    <li>Click "Upload Players (Excel)" button</li>
                    <li>Download the template Excel file (click "Download Template" in the modal)</li>
                    <li>Fill in the template with your player data (all 13 fields are required)</li>
                    <li>For missing data, use "-" as default value</li>
                    <li>Upload the completed Excel file</li>
                    <li>Wait for the import to complete</li>
                  </ol>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    ✏️ Method 2: Manual Entry
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-900 ml-4">
                    <li>Click "Add Player Manually" button</li>
                    <li>Enter player details: number, name, role, base price</li>
                    <li>Add optional information (contact, bowling details, etc.)</li>
                    <li>Click "Add Player" to save</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">📊</span> Excel Template Format
                </h3>
                <p className="text-sm mb-3">The Excel template includes 13 required columns:</p>
                <div className="grid md:grid-cols-2 gap-2 text-xs bg-gray-50 p-4 rounded">
                  <div>1. PLAYER NO.</div>
                  <div>8. BOWLING TYPE</div>
                  <div>2. PLAYER NAME</div>
                  <div>9. BATTING HAND</div>
                  <div>3. ROLE</div>
                  <div>10. BATTING ORDER</div>
                  <div>4. BASE PRICE</div>
                  <div>11. BATTING STYLE</div>
                  <div>5. PREFFERED SET</div>
                  <div>12. COMMENTS</div>
                  <div>6. CONTACT NO.</div>
                  <div>13. SHIFT</div>
                  <div>7. BOWLING ARM</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">📁</span> Managing Sets
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-6">
                  <li>Sets help organize players into groups (e.g., "Set A", "Set B")</li>
                  <li>Create sets to batch-assign players to teams</li>
                  <li>Assign players to sets from the Players tab</li>
                  <li>Use sets to manage auction flow and player distribution</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Live Bidding */}
          <section id="live-bidding" className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎯</span>
              <h2 className="text-3xl font-bold text-gray-900">Live Bidding</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎮</span> Starting an Auction Session
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                  <li>Go to the Dashboard and click "Live Bidding"</li>
                  <li>Select a set of players to auction (e.g., "Set A")</li>
                  <li>The auction session will start with the first player</li>
                  <li>Players will be displayed one at a time for bidding</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">💰</span> Managing Bids
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                  <li><strong>Bid on Players:</strong> Enter a bid amount and click "Bid"</li>
                  <li><strong>Assign to Team:</strong> Select the winning team from the dropdown</li>
                  <li><strong>Record Sale:</strong> Click "Record Sale" to finalize the purchase</li>
                  <li><strong>Skip Player:</strong> Use "Skip" if no bids or unsold</li>
                  <li><strong>Undo:</strong> Use "Undo Last Sale" to correct mistakes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span> Dashboard Features
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                  <li><strong>Team Leaderboard:</strong> Real-time tracking of team budgets and player counts</li>
                  <li><strong>Recent Sales:</strong> See the latest player sales</li>
                  <li><strong>Set Progress:</strong> Monitor how many players from each set are sold</li>
                  <li><strong>Quick Actions:</strong> Access settings, manage teams, and export data</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900">
                  <li>Monitor team budgets to prevent overspending</li>
                  <li>Use the search feature to find specific players during bidding</li>
                  <li>Keep track of team needs (e.g., bowlers, batsmen, all-rounders)</li>
                  <li>Review recent sales to understand bidding patterns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Live View */}
          <section id="live-view" className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📺</span>
              <h2 className="text-3xl font-bold text-gray-900">Live View (Public Spectator Page)</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🔐</span> Enabling Live View
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                  <li>Go to Auction Settings</li>
                  <li>Find "Live View Options" section</li>
                  <li>Toggle "Enable Public Live View" to ON</li>
                  <li>Optionally enable "Viewer Analytics" to track viewership</li>
                  <li>Click "Save Settings"</li>
                  <li>Copy the Live Link from the dashboard</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🌐</span> Sharing the Live Link
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                  <li>The live link provides public access to the auction progress</li>
                  <li>Spectators can view real-time team stats, recent sales, and leaderboard</li>
                  <li>No authentication required - anyone with the link can view</li>
                  <li>Share via WhatsApp, email, or social media</li>
                  <li>Live updates happen automatically via WebSocket connection</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">👁️</span> What Spectators See
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-6">
                  <li><strong>Team Leaderboard:</strong> Ranking based on total budget spent</li>
                  <li><strong>Team Stats:</strong> Player count, budget used, remaining budget</li>
                  <li><strong>Recent Sales:</strong> Latest player sales with team assignments</li>
                  <li><strong>Player Search:</strong> Search and filter players by name, role, or team</li>
                  <li><strong>Live Counter:</strong> Real-time viewer count (if analytics enabled)</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Important</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-900">
                  <li>Live View must be enabled before sharing the link</li>
                  <li>If live view is disabled, a warning message will appear</li>
                  <li>The link only works for active auctions (status: "running")</li>
                  <li>No administrative actions can be performed from the live view page</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Export & Reports */}
          <section id="export-reports" className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📊</span>
              <h2 className="text-3xl font-bold text-gray-900">Export & Reports</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📄</span> Export Final Team Roster
                </h3>
                <p className="text-sm mb-3">After your auction is complete, export the final team roster in multiple formats:</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">📊 Excel Format</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-green-900">
                      <li>Teams Summary tab</li>
                      <li>Players Details tab</li>
                      <li>Auction Summary tab</li>
                      <li>Editable spreadsheet</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">📄 PDF Format</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-blue-900">
                      <li>High-quality print-ready</li>
                      <li>4 teams per page layout</li>
                      <li>Complete player lists</li>
                      <li>Professional formatting</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">💾 JSON Backup</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-orange-900">
                      <li>Complete data backup</li>
                      <li>Machine-readable format</li>
                      <li>Easy data restoration</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Export Features</h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-6">
                  <li>Export includes all teams with their players</li>
                  <li>Player details: number, name, role, sold price</li>
                  <li>Team statistics: budget spent, player count, profit/loss</li>
                  <li>Summary statistics: total players sold, total revenue, averages</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">❓</span>
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-left">How do I add players to my auction?</h3>
                <p className="text-sm text-gray-700 text-left">You can upload players via Excel file (recommended) or add them manually. The Excel template is available in the Players tab - just download it, fill in your player data, and upload it back.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-left">Can I modify a player after they're sold?</h3>
                <p className="text-sm text-gray-700 text-left">Yes! Use the "Undo Last Sale" button in the bidding interface to revert the last sale and make corrections.</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-left">What happens if a team exceeds their budget?</h3>
                <p className="text-sm text-gray-700 text-left">The system prevents teams from bidding beyond their remaining budget. The remaining budget is tracked in real-time and displayed on the dashboard.</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-left">How do I share the auction with spectators?</h3>
                <p className="text-sm text-gray-700 text-left">Enable "Live View" in Auction Settings, then use the "Share Live Link" button in the Dashboard. Anyone with the link can view the auction progress.</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-left">Can I export auction data?</h3>
                <p className="text-sm text-gray-700 text-left">Yes! Go to Setup → Export Team List. You can download in Excel, PDF, or JSON format. The export includes complete team rosters with all player details.</p>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Need More Help?</h2>
              <p className="mb-6 text-blue-100">We're here to assist you with any auction management questions.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate('/help')}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
                >
                  General Help
                </button>
                <a
                  href="mailto:developer.codeshare@gmail.com"
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
          <p>© 2025 CodeShare Auction Management. Made with ❤️ for sports organizers.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuctionHelpPage;
