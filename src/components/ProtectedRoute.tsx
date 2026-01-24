import { getAuth } from "@/hooks/auth/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

export const ProtectedRoute = () => {
  const { isAuthenticated } = getAuth();
  if (!isAuthenticated) {
    toast.error("Você precisa estar logado para acessar essa página.");
    return <Navigate to="/auth/entrar" replace />;
  }

  return <Outlet />;
}