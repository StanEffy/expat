import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import Layout from '@/components/Layouts/Layout';
import AdminLayout from '@/components/Admin/AdminLayout';
import AdminRouteGuard from '@/components/Admin/AdminRouteGuard';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import ErrorBoundary from '@/components/Common/ErrorBoundary';
import AppProviders from '@/providers/AppProviders';
import { ADMIN_PANEL_PATH } from '@/constants/api';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

import Home from '@/pages/Home';
const Companies = lazyWithRetry(() => import('@/pages/Companies'));
const CompanyDetails = lazyWithRetry(() => import('@/pages/CompanyDetails'));
const Categories = lazyWithRetry(() => import('@/pages/Categories'));
const Login = lazyWithRetry(() => import('@/pages/Login'));
const Profile = lazyWithRetry(() => import('@/pages/Profile'));
const ResumeBuilder = lazyWithRetry(() => import('@/pages/ResumeBuilder'));
const About = lazyWithRetry(() => import('@/pages/About'));
const Shop = lazyWithRetry(() => import('@/pages/Shop'));
const PasswordResetRequest = lazyWithRetry(() => import('@/pages/PasswordResetRequest'));
const PasswordReset = lazyWithRetry(() => import('@/pages/PasswordReset'));
const AdminDashboard = lazyWithRetry(() => import('@/pages/admin/AdminDashboard'));
const UsersManagement = lazyWithRetry(() => import('@/pages/admin/UsersManagement'));
const CompanyUpdates = lazyWithRetry(() => import('@/pages/admin/CompanyUpdates'));
const InviteCodes = lazyWithRetry(() => import('@/pages/admin/InviteCodes'));
const Polls = lazyWithRetry(() => import('@/pages/Polls'));
const PollDetail = lazyWithRetry(() => import('@/pages/PollDetail'));
const Onboarding = lazyWithRetry(() => import('@/pages/Onboarding'));
const MunicipalDashboard = lazyWithRetry(() => import('@/pages/MunicipalDashboard'));
const ParticipatoryBudget = lazyWithRetry(() => import('@/pages/ParticipatoryBudget'));
const ServiceRequests = lazyWithRetry(() => import('@/pages/ServiceRequests'));
const Community = lazyWithRetry(() => import('@/pages/Community'));
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'));

const LoadingScreen = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading…</span>
  </div>
);

function App() {
  return (
    <AppProviders>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes with persistent Layout */}
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="categories" element={<Categories />} />
              <Route path="about" element={<About />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="participatory-budget" element={<ParticipatoryBudget />} />
              <Route path="service-requests" element={<ServiceRequests />} />
              <Route path="community" element={<Community />} />
              <Route path="municipal-dashboard" element={<MunicipalDashboard />} />
              <Route path="shop" element={<Shop />} />
              <Route path="login" element={<Login />} />
              <Route path="password-reset/request" element={<PasswordResetRequest />} />
              <Route path="password-reset" element={<PasswordReset />} />

              {/* Protected user routes (require authentication) */}
              <Route element={<ProtectedRoute />}>
                <Route path="companies" element={<Companies />} />
                <Route path="companies/:id" element={<CompanyDetails />} />
                <Route path="polls" element={<Polls />} />
                <Route path="polls/:id" element={<PollDetail />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/resume-builder" element={<ResumeBuilder />} />
              </Route>

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
              <Route path="municipal-analytics" element={<MunicipalDashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
    </AppProviders>
  );
}

export default App;
