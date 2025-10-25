import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SettingsPage from './features/settings/Settings.jsx';
import ManagerDashboard from './features/dashboards/manager/ManagerDashboard.jsx';
import AdminDashboard from './features/dashboards/admin/AdminDashboard.jsx';
import { RequireRole } from './security/RequireRole.jsx';
import LayoutBasic from './components/LayoutBasic.jsx';

// DEV banner (unchanged)
if (import.meta.env.DEV && window.location.port === '3001') {
  const banner = document.createElement('div');
  banner.textContent = 'DEV ENVIRONMENT — localhost:3001';
  banner.style.cssText = `
    position:fixed; top:0; left:0; right:0;
    background:rgba(255,200,0,0.95); padding:6px; text-align:center;
    z-index:9999; font-size:12px; box-shadow:0 2px 6px rgba(0,0,0,0.2);
    font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  `;
  document.body.prepend(banner);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Your existing app */}
        <Route path="/" element={<App />} />

        {/* New pages reusing your site header via LayoutBasic */}
        <Route path="/settings" element={<LayoutBasic><SettingsPage /></LayoutBasic>} />
        <Route
          path="/manager"
          element={
            <LayoutBasic>
              <RequireRole role="Manager">
                <ManagerDashboard />
              </RequireRole>
            </LayoutBasic>
          }
        />
        <Route
          path="/admin"
          element={
            <LayoutBasic>
              <RequireRole role="SuperAdmin">
                <AdminDashboard />
              </RequireRole>
            </LayoutBasic>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
