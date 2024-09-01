import "./App.css";
import MainPage from "./pages/MainPage";
import { Routes, Route } from "react-router-dom";
import toast, {Toaster} from 'react-hot-toast';
import 'flowbite'; 

function App() {
  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/:slug" element={<MainPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="*" element={<MainPage />} />
      </Routes>
      
    </div>
  );
}

export default App;
