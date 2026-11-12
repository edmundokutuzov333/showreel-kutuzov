import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReelStudio from "@/pages/ReelStudio";
import NeuralCranium3D from "@/pages/NeuralCranium3D";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReelStudio />} />
        <Route path="/neural-cranium" element={<NeuralCranium3D />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

