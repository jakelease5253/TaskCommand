// src/components/LayoutBasic.jsx
import React from 'react';
import Header from './layout/Header.jsx';

const noop = () => {};

export default function LayoutBasic({ children, user = null }) {
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
