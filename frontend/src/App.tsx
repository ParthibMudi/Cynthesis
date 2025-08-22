import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { RoutineProvider } from "./contexts/RoutineContext";

// Pages
import LandingPage from "./pages/LandingPage";
import AcademiaSmart from "./pages/AcademiaSmart";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import WeeklyRoutine from "./pages/WeeklyRoutine";
import NotFound from "./pages/NotFound";
import { Import } from "lucide-react";
import RegisterAdminPage from "./pages/RegisterAdminPage";
import LoginPage from "./pages/LoginPage";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AnnouncementProvider>
          <RoutineProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/academia" element={<AcademiaSmart />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/register" element={<RegisterAdminPage />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/routine" element={<WeeklyRoutine />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoutineProvider>
        </AnnouncementProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;