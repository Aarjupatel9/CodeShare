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

function App() {
  return (
    <div className="App">
      <Toaster />
      <UserProvider>
        <Routes>
          <Route path="/auth/login" element={<LoginComponent />} />
          <Route path="/auth/register" element={<RegisterComponent />} />
          <Route path='/auth/forgetpassword' element={<ForgetPasswordComponent/>}/>
          <Route path="/:slug" element={<PublicPages/>} />
          <Route path="/p/:username/" element={<PrivatePages />} />
          <Route path="/p/:username/:slug" element={<PrivatePages />} />
          <Route path="/" element={<PublicPages />} />
          <Route path="*" element={<PublicPages />} />
        </Routes>
      </UserProvider>
    </div>
  );
}


export default App;