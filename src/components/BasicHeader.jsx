import React from 'react';
import { Link } from 'react-router-dom';

export default function BasicHeader() {
  return (
    <header className="flex items-center gap-4 px-4 py-3 border-b">
      <Link to="/" className="font-semibold">TaskCommand</Link>
      <nav className="flex gap-3 text-sm">
        <Link to="/settings">Settings</Link>
        <Link to="/manager">Manager</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}
