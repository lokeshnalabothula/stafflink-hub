import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import EmployeesPage from "@/pages/EmployeesPage";
import AttendancePage from "@/pages/AttendancePage";
import LeavesPage from "@/pages/LeavesPage";
import PayrollPage from "@/pages/PayrollPage";
import ReportsPage from "@/pages/ReportsPage";
import ProfilePage from "@/pages/ProfilePage";
import OrdersPage from "@/pages/OrdersPage";
import CustomersPage from "@/pages/CustomersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Get the basename from the current URL for GitHub Pages compatibility
 * For project repos: /repository-name
 * For user/org pages: /
 */
const getBasename = () => {
  const base = import.meta.env.BASE_URL || "/";
  return base;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter basename={getBasename()}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/orders" element={<AppLayout><OrdersPage /></AppLayout>} />
            <Route path="/customers" element={<AppLayout><CustomersPage /></AppLayout>} />
            <Route path="/employees" element={<AppLayout><EmployeesPage /></AppLayout>} />
            <Route path="/attendance" element={<AppLayout><AttendancePage /></AppLayout>} />
            <Route path="/leaves" element={<AppLayout><LeavesPage /></AppLayout>} />
            <Route path="/payroll" element={<AppLayout><PayrollPage /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
