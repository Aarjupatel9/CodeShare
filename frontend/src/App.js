import "./App.css";
import MainPage from "./pages/MainPage";
import { Routes, Route } from "react-router-dom";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/:slug" element={<MainPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="*" element={<MainPage />} />
      </Routes>
      
    </div>
  );
}

export default App;
