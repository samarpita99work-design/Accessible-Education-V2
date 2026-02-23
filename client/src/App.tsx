import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { ProfileSetupModal } from "@/components/profile-setup-modal";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/login";
import PreLoginAccessibilityPage from "@/pages/pre-login-accessibility";
import StudentDashboard from "@/pages/student-dashboard";
import StudentCourses from "@/pages/student-courses";
import StudentCourseDetail from "@/pages/student-course-detail";
import StudentAssessments from "@/pages/student-assessments";
import ContentViewer from "@/pages/content-viewer";
import AssessmentTaking from "@/pages/assessment-taking";
import MessagesPage from "@/pages/messages";
import AnnouncementsPage from "@/pages/announcements";
import TeacherDashboard from "@/pages/teacher-dashboard";
import TeacherCourseDetail from "@/pages/teacher-course-detail";
import TeacherConversions from "@/pages/teacher-conversions";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminHierarchy from "@/pages/admin-hierarchy";
import AdminUsers from "@/pages/admin-users";
import AdminCourses from "@/pages/admin-courses";
import AdminEnrollment from "@/pages/admin-enrollment";
import AdminConversions from "@/pages/admin-conversions";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminSettings from "@/pages/admin-settings";

function AppRoutes() {
  const [location] = useLocation();
  const isAuth = location === "/login" || location === "/pre-login-accessibility" || location === "/";

  if (isAuth) {
    return (
      <Switch>
        <Route path="/" component={() => <Redirect to="/login" />} />
        <Route path="/login" component={LoginPage} />
        <Route path="/pre-login-accessibility" component={PreLoginAccessibilityPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full" data-testid="app-layout">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Switch>
            <Route path="/student/dashboard" component={StudentDashboard} />
            <Route path="/student/courses" component={StudentCourses} />
            <Route path="/student/courses/:id" component={StudentCourseDetail} />
            <Route path="/student/assessments" component={StudentAssessments} />
            <Route path="/student/assessments/:id" component={AssessmentTaking} />
            <Route path="/student/content/:id" component={ContentViewer} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/announcements" component={AnnouncementsPage} />
            <Route path="/teacher/dashboard" component={TeacherDashboard} />
            <Route path="/teacher/courses/:id" component={TeacherCourseDetail} />
            <Route path="/teacher/courses" component={TeacherDashboard} />
            <Route path="/teacher/content" component={TeacherDashboard} />
            <Route path="/teacher/conversions" component={TeacherConversions} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/hierarchy" component={AdminHierarchy} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/courses" component={AdminCourses} />
            <Route path="/admin/enrollment" component={AdminEnrollment} />
            <Route path="/admin/conversions" component={AdminConversions} />
            <Route path="/admin/analytics" component={AdminAnalytics} />
            <Route path="/admin/settings" component={AdminSettings} />
            <Route path="/profile" component={StudentDashboard} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
      <ProfileSetupModal />
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
