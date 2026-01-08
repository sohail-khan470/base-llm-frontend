import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ChatDetail from "./pages/ChatDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OrganizationRegister from "./pages/OrganizationRegister";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/auth-store";

function App() {
  const { initializeAuth, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    // <Layout>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register-org" element={<OrganizationRegister />} />

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
      <Route path="*" element={<NotFound />} />
    </Routes>
    // </Layout>
  );
}

export default App;
