import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReelStudio from "@/pages/ReelStudio";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReelStudio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

