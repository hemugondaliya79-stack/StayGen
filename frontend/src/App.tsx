import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/Landing'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword'));

// Admin pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StudentsPage = lazy(() => import('./pages/admin/Students'));
const RoomsPage = lazy(() => import('./pages/admin/Rooms'));
const BookingsPage = lazy(() => import('./pages/admin/Bookings'));
const ComplaintsPage = lazy(() => import('./pages/admin/Complaints'));
const AttendancePage = lazy(() => import('./pages/admin/Attendance'));
const MessPage = lazy(() => import('./pages/admin/Mess'));
const FeesPage = lazy(() => import('./pages/admin/Fees'));
const VisitorsPage = lazy(() => import('./pages/admin/Visitors'));
const NoticesPage = lazy(() => import('./pages/admin/Notices'));
const InventoryPage = lazy(() => import('./pages/admin/Inventory'));
const LaundryPage = lazy(() => import('./pages/admin/Laundry'));
const LostFoundPage = lazy(() => import('./pages/admin/LostFound'));

// Student pages
const StudentLayout = lazy(() => import('./layouts/StudentLayout'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const StudentBooking = lazy(() => import('./pages/student/Booking'));
const StudentComplaints = lazy(() => import('./pages/student/Complaints'));
const StudentAttendance = lazy(() => import('./pages/student/Attendance'));
const StudentFees = lazy(() => import('./pages/student/Fees'));
const StudentMess = lazy(() => import('./pages/student/Mess'));
const StudentVisitors = lazy(() => import('./pages/student/Visitors'));
const StudentNotices = lazy(() => import('./pages/student/Notices'));
const StudentLaundry = lazy(() => import('./pages/student/Laundry'));
const StudentLostFound = lazy(() => import('./pages/student/LostFound'));

// Security pages
const SecurityLayout = lazy(() => import('./layouts/SecurityLayout'));
const SecurityDashboard = lazy(() => import('./pages/security/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center animate-pulse">
        <span className="text-white font-bold">S</span>
      </div>
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />

                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute allowedRoles={['super_admin', 'hostel_admin']} />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="rooms" element={<RoomsPage />} />
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="complaints" element={<ComplaintsPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="mess" element={<MessPage />} />
                    <Route path="fees" element={<FeesPage />} />
                    <Route path="visitors" element={<VisitorsPage />} />
                    <Route path="notices" element={<NoticesPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="laundry" element={<LaundryPage />} />
                    <Route path="lost-found" element={<LostFoundPage />} />
                  </Route>
                </Route>

                {/* Student routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                  <Route path="/student" element={<StudentLayout />}>
                    <Route index element={<StudentDashboard />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="booking" element={<StudentBooking />} />
                    <Route path="complaints" element={<StudentComplaints />} />
                    <Route path="attendance" element={<StudentAttendance />} />
                    <Route path="fees" element={<StudentFees />} />
                    <Route path="mess" element={<StudentMess />} />
                    <Route path="visitors" element={<StudentVisitors />} />
                    <Route path="notices" element={<StudentNotices />} />
                    <Route path="laundry" element={<StudentLaundry />} />
                    <Route path="lost-found" element={<StudentLostFound />} />
                  </Route>
                </Route>

                {/* Security routes */}
                <Route element={<ProtectedRoute allowedRoles={['security']} />}>
                  <Route path="/security" element={<SecurityLayout />}>
                    <Route index element={<SecurityDashboard />} />
                    <Route path="visitors" element={<VisitorsPage />} />
                  </Route>
                </Route>

                <Route path="/unauthorized" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold gradient-text mb-4">403</h1>
                      <p className="text-slate-600 mb-6">You don't have permission to access this page.</p>
                      <a href="/" className="gradient-bg text-white px-6 py-3 rounded-xl">Go Home</a>
                    </div>
                  </div>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1E293B', color: '#F1F5F9', borderRadius: '12px', border: '1px solid #334155' },
              success: { iconTheme: { primary: '#22C55E', secondary: '#F0FDF4' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#FEF2F2' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
