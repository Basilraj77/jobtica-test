import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';

// Base path for deployment - empty string for root deployment
export const basePath = '';

import PublicWebsite from './pages/PublicWebsite';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanel from './pages/AdminPanel';
import JobDetailPage from './pages/JobDetailPage';
import BlogDetailPage from './pages/BlogDetailPage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';
import Disclaimer from './pages/Disclaimer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Security: Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

// Handle manual routing for better SEO and navigation
const RouteHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Update the page title based on the current route
    const titles: Record<string, string> = {
      '/': 'Jobtica - Your Gateway to Government Jobs',
      '/about': 'About Us - Jobtica',
      '/contact': 'Contact Us - Jobtica',
      '/admin/login': 'Admin Login - Jobtica',
      '/disclaimer': 'Disclaimer - Jobtica',
      '/privacy': 'Privacy Policy - Jobtica',
      '/terms': 'Terms and Conditions - Jobtica'
    };

    document.title = titles[location.pathname] || 'Jobtica - Your Gateway to Government Jobs';

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

const App: React.FC = () => {
  // Helper to create wrapper components that inject `navigate` (and params) into pages
  const makeWithNav = (Component: any) => {
    return (props: any) => {
      const navigate = useNavigate();
      const params = useParams();
      return <Component {...props} navigate={navigate} params={params} />;
    };
  };

  const PublicWithNavigate = makeWithNav(PublicWebsite);
  const AboutWithNavigate = makeWithNav(AboutUs);
  const ContactWithNavigate = makeWithNav(ContactPage);
  const DisclaimerWithNavigate = makeWithNav(Disclaimer);
  const PrivacyWithNavigate = makeWithNav(PrivacyPolicy);
  const TermsWithNavigate = makeWithNav(TermsAndConditions);
  const JobDetailWithNavigate = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    return <JobDetailPage jobSlug={slug as string} navigate={navigate} />;
  };
  const BlogDetailWithNavigate = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    return <BlogDetailPage postId={slug as string} navigate={navigate} />;
  };
  const AdminLoginWithNavigate = makeWithNav(AdminLoginPage);
  const AdminPanelWithNavigate = makeWithNav(AdminPanel);

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <RouteHandler />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicWithNavigate />} />
            <Route path="/about" element={<AboutWithNavigate />} />
            <Route path="/contact" element={<ContactWithNavigate />} />
            <Route path="/disclaimer" element={<DisclaimerWithNavigate />} />
            <Route path="/privacy" element={<PrivacyWithNavigate />} />
            <Route path="/terms" element={<TermsWithNavigate />} />
            
            {/* Dynamic Routes */}
            <Route path="/jobs/:slug" element={<JobDetailWithNavigate />} />
            <Route path="/blog/:slug" element={<BlogDetailWithNavigate />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginWithNavigate />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanelWithNavigate />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
