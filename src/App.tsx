import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from "@/pages/StartPage";
import GamePage from "@/pages/GamePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/game/:chapterId" element={<GamePage />} />
      </Routes>
    </Router>
  );
}
