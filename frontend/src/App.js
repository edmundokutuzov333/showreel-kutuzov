import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReelStudio from "@/pages/ReelStudio";
import NeuralCranium3D from "@/pages/NeuralCranium3D";
import SiteTourV4 from "@/pages/SiteTourV4";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReelStudio />} />
        <Route path="/neural-cranium" element={<NeuralCranium3D />} />
        <Route path="/v4" element={<SiteTourV4 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

