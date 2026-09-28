import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './layouts/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { PackagesPage } from './pages/PackagesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { TasksPage } from './pages/TasksPage';
import { ReelsWorkflowPage } from './pages/ReelsWorkflowPage';
import { ContentCalendarPage } from './pages/ContentCalendarPage';
import { ShootsPage } from './pages/ShootsPage';
import { CameraMenPage } from './pages/CameraMenPage';
import { ModelsPage } from './pages/ModelsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { StaffPage } from './pages/StaffPage';
import { ReportsPage } from './pages/ReportsPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/followups" element={<FollowUpsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/reels" element={<ReelsWorkflowPage />} />
            <Route path="/calendar" element={<ContentCalendarPage />} />
            <Route path="/shoots" element={<ShootsPage />} />
            <Route path="/cameramen" element={<CameraMenPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/activity-log" element={<ActivityLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
