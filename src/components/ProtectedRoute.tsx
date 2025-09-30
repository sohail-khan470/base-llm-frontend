import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "../store/auth-store";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
