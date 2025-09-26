import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChatDetail from "./pages/ChatDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/:chatId" element={<ChatDetail />} />
    </Routes>
  );
}

export default App;
