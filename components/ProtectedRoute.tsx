import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import AdminLoginPage from '../pages/AdminLoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, authStage } = useAuth();

  // Show loading state while checking authentication
  if (authStage === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <AdminLoginPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;