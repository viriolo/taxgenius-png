
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/models/User";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import TaxCalculator from "./pages/TaxCalculator";
import PNGIncomeTaxCalculator from "./pages/PNGIncomeTaxCalculator";
import LegalServices from "./pages/LegalServices";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component to include Navbar and Footer on all pages
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="wantok-ai-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/signup" element={<Layout><Signup /></Layout>} />
              <Route path="/unauthorized" element={<Layout><Unauthorized /></Layout>} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <Layout>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/tax-calculator" element={
                <Layout>
                  <ProtectedRoute>
                    <TaxCalculator />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/income-tax-calculator" element={
                <Layout>
                  <ProtectedRoute>
                    <PNGIncomeTaxCalculator />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/legal-services" element={
                <Layout>
                  <ProtectedRoute>
                    <LegalServices />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/reports" element={
                <Layout>
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/profile" element={
                <Layout>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </Layout>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <Layout>
                  <ProtectedRoute roles={[UserRole.ADMIN]}>
                    <div>Admin Dashboard</div>
                  </ProtectedRoute>
                </Layout>
              } />
              
              {/* Help page accessible to all */}
              <Route path="/help" element={<Layout><Help /></Layout>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
