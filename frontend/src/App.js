import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./context/UserContext";

// Pages
import MainPage from "./pages/MainPage";
import LoginComponent from "./pages/LoginComponent";
import RegisterComponent from "./pages/RegisterComponent";
import ForgetPasswordComponent from "./pages/ForgetPasswordComponent";
import PublicPages from "./pages/PublicPages";
import HelpPage from "./pages/HelpPage";
import AboutPage from "./pages/AboutPage";
import UserProfilePage from "./pages/UserProfilePage";

// Features
import GamePage from "./gamePlugin/GamePage";

// Auction
import AuctionHome from "./auction/AuctionHome";
import AuctionMain from "./auction/AuctionMain";
import AuctionDetailsManage from "./auction/AuctionDetailsManage";
import AuctionBidding from "./auction/AuctionBidding";
import AuctionLiveUpdate from "./auction/AuctionLiveUpdate";

// Route components
import PrivateRoute from "./components/routes/PrivateRoute";
import PublicRoute from "./components/routes/PublicRoute";

function App() {
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
          
          {/* Information Pages */}
          <Route path="/help" element={<PublicRoute component={HelpPage} />} />
          <Route path="/about" element={<PublicRoute component={AboutPage} />} />
          
          {/* Games */}
          <Route path="/games" element={<PublicRoute component={GamePage} />} />
          <Route path="/game/:gameName" element={<PublicRoute component={GamePage} />} />
          
          {/* Public Auction View */}
          <Route path="/t/auction/:auctionId/live" element={<PublicRoute component={AuctionLiveUpdate} />} />
          
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
          
          {/* Documents */}
          <Route path="/p/:userId/" element={<PrivateRoute component={MainPage} />} />
          <Route path="/p/:userId/:slug" element={<PrivateRoute component={MainPage} />} />
          
          {/* Auction Management */}
          <Route path="/p/:userId/t/auction/" element={<PrivateRoute component={AuctionHome} />} />
          <Route path="/p/:userId/t/auction/:auctionId" element={<PrivateRoute component={AuctionMain} />} />
          <Route path="/p/:userId/t/auction/:auctionId/manage" element={<PrivateRoute component={AuctionDetailsManage} />} />
          <Route path="/p/:userId/t/auction/:auctionId/bidding" element={<PrivateRoute component={AuctionBidding} />} />
          
          {/* Fallback */}
          <Route path="*" element={<PublicRoute component={PublicPages} />} />
        </Routes>
      </UserProvider>
    </div>
  );
}


export default App;