import "./App.css";
import MainPage from "./pages/MainPage";
import { Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoginComponent from "./pages/LoginComponent";
import RegisterComponent from "./pages/RegisterComponent";
import { UserProvider } from "./context/UserContext";


function App() {
  return (
    <div className="App">
      <Toaster />
      <UserProvider>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />
          <Route path="/:slug" element={<MainPage isPersonal={false} />} />
          <Route path="/:username/:slug" element={<MainPage isPersonal={true} />} />
          <Route path="/" element={<MainPage isPersonal={false} />} />
          <Route path="*" element={<MainPage isPersonal={false} />} />
        </Routes>
      </UserProvider>
    </div>
  );
}


export default App;