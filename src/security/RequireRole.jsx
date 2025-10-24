// src/security/RequireRole.jsx
import React from 'react';

// TODO: replace this with real roles from Settings/Entra
const getUserRole = () => 'User';

export function RequireRole({ role, children }) {
  const userRole = getUserRole();
  const allowed = role === 'User' || userRole === role || userRole === 'SuperAdmin';
  return allowed ? <>{children}</> : null; // could render a 403 later
}
