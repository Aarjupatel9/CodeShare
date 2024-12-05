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
import AuctionSetManage from "./auction/AuctionSetManage";
import AuctionBidding from "./auction/AuctionBidding";
import AuctionLiveUpdate from "./auction/AuctionLiveUpdate";

function App() {
  return (
    <div className="App">
      <Toaster />
      <UserProvider>
        <Routes>
          <Route path="/t/auction/" element={<AuctionHome />} />
          <Route path="/t/auction/:auctionId" element={<AuctionMain />} />
          <Route path="/t/auction/:auctionId/manageset" element={<AuctionSetManage />} />
          <Route path="/t/auction/:auctionId/bidding" element={<AuctionBidding />} />
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