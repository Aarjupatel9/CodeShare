import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./context/UserContext";
import { useEffect, useState } from "react";
import { preloadConfig } from "./hooks/useConfig";

// Pages
import MainPage from "./pages/MainPage";
import LoginComponent from "./pages/LoginComponent";
import RegisterComponent from "./pages/RegisterComponent";
import ForgetPasswordComponent from "./pages/ForgetPasswordComponent";
import ResetPasswordComponent from "./pages/ResetPasswordComponent";
import PublicPages from "./pages/PublicPages";
import HelpPage from "./pages/HelpPage";
import AboutPage from "./pages/AboutPage";
import AuctionHelpPage from "./pages/AuctionHelpPage";
import UserProfilePage from "./pages/UserProfilePage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminDocuments from "./pages/admin/AdminDocuments";

// Features
import GamePage from "./gamePlugin/GamePage";

// Auction
import AuctionHome from "./auction/AuctionHome";
import AuctionDashboard from "./auction/AuctionDashboard";
import AuctionSetup from "./auction/AuctionSetup";
import AuctionBidding from "./auction/AuctionBidding";
import AuctionLiveView from "./auction/AuctionLiveView";

// Route components
import PrivateRoute from "./components/routes/PrivateRoute";
import PublicRoute from "./components/routes/PublicRoute";

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);

  // Preload config on app initialization - MUST finish before routes render
  useEffect(() => {
    preloadConfig().then(() => {
      setConfigLoaded(true);
    }).catch((err) => {
      console.error('Failed to load config:', err);
      setConfigLoaded(true); // Still render app even if config fails
    });
  }, []);

  // Don't render routes until config is loaded
  if (!configLoaded) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading...
        </div>
      </div>
    );
  }
  
  return (
    <div className="App">
      <Toaster />
      <UserProvider>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          
          {/* Authentication */}
          <Route path="/auth/login" element={<PublicRoute component={LoginComponent} />} />
          <Route path="/auth/register" element={<PublicRoute component={RegisterComponent} />} />
          <Route path="/auth/forgetpassword" element={<PublicRoute component={ForgetPasswordComponent} />} />
          <Route path="/auth/reset-password/:id/:token" element={<PublicRoute component={ResetPasswordComponent} />} />
          
          {/* Information Pages */}
          <Route path="/help" element={<PublicRoute component={HelpPage} />} />
          <Route path="/about" element={<PublicRoute component={AboutPage} />} />
          
          {/* Games */}
          <Route path="/games" element={<PublicRoute component={GamePage} />} />
          <Route path="/game/:gameName/*" element={<PublicRoute component={GamePage} />} />
          
          {/* Public Auction View */}
          <Route path="/t/auction/:auctionId/live" element={<PublicRoute component={AuctionLiveView} />} />
          
          {/* Public Documents */}
          <Route path="/:userId/:slug" element={<PublicRoute component={PublicPages} />} />
          <Route path="/:slug" element={<PublicRoute component={PublicPages} />} />
          <Route path="/" element={<PublicRoute component={PublicPages} />} />
          
          {/* ==================== PRIVATE ROUTES ==================== */}
          
          {/* Information Pages (skipAuth for performance) */}
          <Route path="/p/:userId/help" element={<PrivateRoute component={HelpPage} skipAuth={true} />} />
          <Route path="/p/:userId/about" element={<PrivateRoute component={AboutPage} skipAuth={true} />} />
          
          {/* User Profile */}
          <Route path="/p/:userId/profile" element={<PrivateRoute component={UserProfilePage} />} />
          
          {/* Admin Panel */}
          <Route path="/p/:userId/admin" element={<PrivateRoute component={AdminDashboard} />} />
          <Route path="/p/:userId/admin/users" element={<PrivateRoute component={AdminUsers} />} />
          <Route path="/p/:userId/admin/activity" element={<PrivateRoute component={AdminActivity} />} />
          <Route path="/p/:userId/admin/documents" element={<PrivateRoute component={AdminDocuments} />} />
          
          {/* Documents */}
          <Route path="/p/:userId/" element={<PrivateRoute component={MainPage} />} />
          <Route path="/p/:userId/:slug" element={<PrivateRoute component={MainPage} />} />
          
          {/* Auction Management */}
          <Route path="/p/:userId/t/auction/" element={<PrivateRoute component={AuctionHome} />} />
          <Route path="/p/:userId/t/auction/help" element={<PrivateRoute component={AuctionHelpPage} />} />
          <Route path="/p/:userId/t/auction/:auctionId" element={<PrivateRoute component={AuctionDashboard} />} />
          <Route path="/p/:userId/t/auction/:auctionId/manage" element={<PrivateRoute component={AuctionSetup} />} />
          <Route path="/p/:userId/t/auction/:auctionId/bidding" element={<PrivateRoute component={AuctionBidding} />} />
          
          {/* Fallback */}
          <Route path="*" element={<PublicRoute component={PublicPages} />} />
        </Routes>
      </UserProvider>
    </div>
  );
}


export default App;