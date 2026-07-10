import { useAppSelector } from "@/app/features/hooks";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
