import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ChatDetail from "./pages/ChatDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/auth-store";

function App() {
  const { initializeAuth, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  console.log(user, "UUUUUUUUU");

  return (
    // <Layout>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats/:chatId"
        element={
          <ProtectedRoute>
            <Layout>
              <ChatDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
    // </Layout>
  );
}

export default App;
