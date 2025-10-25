// src/features/dashboards/admin/AdminDashboard.jsx
import React from 'react';
import '/src/index.css'; // keep global styles
export default function AdminDashboard() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">All-Company Dashboard</h1>
      <p className="mt-2">Org-wide open tasks (MVP stub). Visible to Super Admins only.</p>
    </div>
  );
}
