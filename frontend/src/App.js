import "./App.css";
import MainPage from "./pages/MainPage";
import { Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoginComponent from "./pages/LoginComponent";
import RegisterComponent from "./pages/RegisterComponent";
import { UserProvider } from "./context/UserContext";
import ForgetPasswordComponent from "./pages/ForgetPasswordComponent";
import PublicPages from "./pages/PublicPages";
import PrivatePages from "./pages/PrivatePages";
import GamePage from "./gamePlugin/GamePage";
import AuctionHome from "./auction/AuctionHome";
import AuctionMain from "./auction/AuctionMain";
import AuctionDetailsManage from "./auction/AuctionDetailsManage";
import AuctionBidding from "./auction/AuctionBidding";
import AuctionLiveUpdate from "./auction/AuctionLiveUpdate";
import HelpPage from "./pages/HelpPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <div className="App">
      <Toaster />
      <UserProvider>
        <Routes>
          {/* Help and About - Public */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Help and About - Private */}
          <Route path="/p/help" element={<HelpPage />} />
          <Route path="/p/about" element={<AboutPage />} />
          
          {/* Auction Routes - Private (management) */}
          <Route path="/p/t/auction/" element={<AuctionHome />} />
          <Route path="/p/t/auction/:auctionId" element={<AuctionMain />} />
          <Route path="/p/t/auction/:auctionId/manage" element={<AuctionDetailsManage />} />
          <Route path="/p/t/auction/:auctionId/bidding" element={<AuctionBidding />} />
          
          {/* Auction Live - Public (when enabled by organizer) */}
          <Route path="/t/auction/:auctionId/live" element={<AuctionLiveUpdate />} />
          <Route path="/games" element={<GamePage />} />
          <Route path="/game/:gameName" element={<GamePage />} />
          <Route path="/auth/login" element={<LoginComponent />} />
          <Route path="/auth/register" element={<RegisterComponent />} />
          <Route path='/auth/forgetpassword' element={<ForgetPasswordComponent />} />
          <Route path="/p/" element={<PrivatePages />} />
          <Route path="/p/:username/" element={<PrivatePages />} />
          <Route path="/p/:username/:slug" element={<PrivatePages />} />
          <Route path="/:slug" element={<PublicPages />} />
          <Route path="/" element={<PublicPages />} />
          <Route path="*" element={<PublicPages />} />
        </Routes>
      </UserProvider>
    </div>
  );
}


export default App;