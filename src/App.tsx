import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '@/components/Layouts/Layout';
import AdminLayout from '@/components/Admin/AdminLayout';
import AdminRouteGuard from '@/components/Admin/AdminRouteGuard';
import AppProviders from '@/providers/AppProviders';
import { ADMIN_PANEL_PATH } from '@/constants/api';

const Home = lazy(() => import('@/pages/Home'));
const Companies = lazy(() => import('@/pages/Companies'));
const CompanyDetails = lazy(() => import('@/pages/CompanyDetails'));
const Categories = lazy(() => import('@/pages/Categories'));
const Login = lazy(() => import('@/pages/Login'));
const Profile = lazy(() => import('@/pages/Profile'));
const ResumeBuilder = lazy(() => import('@/pages/ResumeBuilder'));
const About = lazy(() => import('@/pages/About'));
const Shop = lazy(() => import('@/pages/Shop'));
const PasswordResetRequest = lazy(() => import('@/pages/PasswordResetRequest'));
const PasswordReset = lazy(() => import('@/pages/PasswordReset'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const UsersManagement = lazy(() => import('@/pages/admin/UsersManagement'));
const CompanyUpdates = lazy(() => import('@/pages/admin/CompanyUpdates'));
const InviteCodes = lazy(() => import('@/pages/admin/InviteCodes'));
const Polls = lazy(() => import('@/pages/Polls'));
const PollDetail = lazy(() => import('@/pages/PollDetail'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const LoadingScreen = () => (
  <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
    <span>Loading…</span>
  </div>
);

function App() {
  return (
    <AppProviders>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes with persistent Layout */}
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="companies" element={<Companies />} />
              <Route path="companies/:id" element={<CompanyDetails />} />
              <Route path="categories" element={<Categories />} />
              <Route path="about" element={<About />} />
              <Route path="shop" element={<Shop />} />
              <Route path="polls" element={<Polls />} />
              <Route path="polls/:id" element={<PollDetail />} />
              <Route path="login" element={<Login />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/resume-builder" element={<ResumeBuilder />} />
              <Route path="password-reset/request" element={<PasswordResetRequest />} />
              <Route path="password-reset" element={<PasswordReset />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Protected admin routes with AdminLayout */}
            <Route
              path={ADMIN_PANEL_PATH}
              element={
                <AdminRouteGuard>
                  <AdminLayout />
                </AdminRouteGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="company-updates" element={<CompanyUpdates />} />
              <Route path="invite-codes" element={<InviteCodes />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AppProviders>
  );
}

export default App;
