import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";
import FacultyDashboard from "./pages/FacultyDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import DepartmentPage from "./pages/DepartmentPage.tsx";
import DepartmentSettings from "./pages/DepartmentSettings.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/department/:departmentId" element={<DepartmentPage />} />
          <Route path="/department/:departmentId/settings" element={<DepartmentSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
