import React from 'react';
import Header from './Header.jsx';

// Later we can pass real handlers/user from your auth/store.
// For now, no-ops keep the Header looking right without breaking clicks.
const noop = () => {};

export default function LayoutSite({ children, user = null }) {
  return (
    <div>
      <Header
        user={user}
        showDashboard={false}
        onToggleDashboard={noop}
        onRefresh={noop}
        onLogout={noop}
        loading={false}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
