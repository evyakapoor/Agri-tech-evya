import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MainLayout } from './layouts/MainLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AdminRoute } from './components/AdminRoute.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { FarmsPage } from './pages/FarmsPage.jsx';
import { FarmDetailPage } from './pages/FarmDetailPage.jsx';
import { CropsPage } from './pages/CropsPage.jsx';
import { SoilAnalysisPage } from './pages/SoilAnalysisPage.jsx';
import { WeatherPage } from './pages/WeatherPage.jsx';
import { PestAlertsPage } from './pages/PestAlertsPage.jsx';
import { MarketplacePage } from './pages/MarketplacePage.jsx';
import { ConsultationsPage } from './pages/ConsultationsPage.jsx';
import { CommunityPage } from './pages/CommunityPage.jsx';
import { ActivitiesPage } from './pages/ActivitiesPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/:id" element={<FarmDetailPage />} />
          <Route path="/crops" element={<CropsPage />} />
          <Route path="/soil" element={<SoilAnalysisPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/pest-alerts" element={<PestAlertsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Protected Control Panel */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default App;
