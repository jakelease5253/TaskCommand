import React from 'react';
import { Plus } from 'lucide-react';

const RefreshIcon = ({ color = 'var(--theme-primary)' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
  </svg>
);

export default function ActionButtons({ onRefresh, onNewTask, loading = false }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '110px',
          height: '40px',
          border: '0',
          boxSizing: 'border-box',
          borderRadius: '8px',
          backgroundColor: 'var(--theme-primary-dark)',
          color: 'var(--theme-primary)',
          fontSize: '14px',
          fontFamily: 'Poppins',
          fontWeight: '500',
          outline: 'none',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
          gap: '8px',
        }}
        title="Refresh"
      >
        <RefreshIcon color="var(--theme-primary)" />
        Refresh
      </button>

      {/* New Task Button */}
      <button
        onClick={onNewTask}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '110px',
          height: '40px',
          border: '0',
          boxSizing: 'border-box',
          borderRadius: '8px',
          backgroundColor: 'var(--theme-primary)',
          color: 'var(--theme-primary-dark)',
          fontSize: '14px',
          fontFamily: 'Poppins',
          fontWeight: '500',
          outline: 'none',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
        }}
        title="New Task"
      >
        <Plus size={18} style={{ color: 'var(--theme-primary-dark)' }} />
        New Task
      </button>
    </div>
  );
}
