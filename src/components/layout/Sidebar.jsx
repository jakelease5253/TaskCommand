import React from 'react';

// Icon components from Uizard exports
const HomeIcon = ({ color = 'var(--theme-primary)' }) => (
  <svg style={{ color, fill: color, width: '21px', height: '21px' }} viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const ChevronIcon = ({ color = 'var(--theme-primary-dark)' }) => (
  <svg style={{ color, fill: color, width: '14px', height: '14px' }} viewBox="0 0 24 24">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M6.23 20.23 8 22l10-10L8 2 6.23 3.77 14.46 12z" />
  </svg>
);

const PlanningIcon = ({ color = 'var(--theme-primary-dark)' }) => (
  <svg style={{ color, fill: color, width: '21px', height: '21px' }} viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
  </svg>
);

const InsightsIcon = ({ color = 'var(--theme-primary-dark)' }) => (
  <svg style={{ color, fill: color, width: '21px', height: '21px' }} viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M21 8c-1.45 0-2.26 1.44-1.93 2.51l-3.55 3.56c-.3-.09-.74-.09-1.04 0l-2.55-2.55C12.27 10.45 11.46 9 10 9c-1.45 0-2.27 1.44-1.93 2.52l-4.56 4.55C2.44 15.74 1 16.55 1 18c0 1.1.9 2 2 2 1.45 0 2.26-1.44 1.93-2.51l4.55-4.56c.3.09.74.09 1.04 0l2.55 2.55C12.73 16.55 13.54 18 15 18c1.45 0 2.27-1.44 1.93-2.52l3.56-3.55c1.07.33 2.51-.48 2.51-1.93 0-1.1-.9-2-2-2z" />
    <path d="m15 9 .94-2.07L18 6l-2.06-.93L15 3l-.92 2.07L12 6l2.08.93zM3.5 11 4 9l2-.5L4 8l-.5-2L3 8l-2 .5L3 9z" />
  </svg>
);

const ManagerIcon = ({ color = 'var(--theme-primary-dark)' }) => (
  <svg style={{ color, fill: color, width: '21px', height: '21px' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const SettingsIcon = ({ color = 'var(--theme-primary-dark)' }) => (
  <svg style={{ color, fill: color, width: '21px', height: '21px' }} viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
  </svg>
);

const LogoutIcon = ({ color = '#000000' }) => (
  <svg style={{ color, fill: color, width: '21px', height: '21px' }} viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const MenuIcon = ({ color = 'var(--theme-primary)' }) => (
  <svg style={{ color, fill: color, width: '14px', height: '14px' }} viewBox="0 0 448 512">
    <path d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z" />
  </svg>
);

const RefreshIcon = ({ color = 'var(--theme-primary)' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
  </svg>
);

const PlusIcon = ({ color = 'var(--theme-primary-dark)' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function Sidebar({
  currentView = 'personal',
  onNavigate,
  onLogout,
  isExpanded = false,
  onToggle,
  onRefresh,
  onNewTask,
  loading = false
}) {
  const menuItems = [
    { id: 'personal', icon: HomeIcon, label: 'Home' },
    { id: 'planning', icon: PlanningIcon, label: 'Planning' },
    { id: 'insights', icon: InsightsIcon, label: 'Insights' },
    { id: 'manager', icon: ManagerIcon, label: 'Manager Dashboard' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const NavButton = ({ item, isActive }) => {
    const IconComponent = item.icon;
    return (
      <button
        onClick={() => onNavigate(item.id)}
        style={{
          cursor: 'pointer',
          width: isExpanded ? '220px' : '46px',
          height: '46px',
          padding: isExpanded ? '0px 16px' : '0px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: isExpanded ? '12px' : '0',
          border: '0',
          boxSizing: 'border-box',
          borderRadius: '8px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
          backgroundColor: isActive ? 'var(--theme-primary-dark)' : 'rgba(0,0,0,0)',
          outline: 'none',
          marginBottom: '20px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
        title={item.label}
      >
        <IconComponent color={isActive ? 'var(--theme-primary)' : 'var(--theme-primary-dark)'} />
        {isExpanded && (
          <span
            style={{
              color: isActive ? 'var(--theme-primary)' : 'var(--theme-primary-dark)',
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: isExpanded ? '258px' : '84px',
        backgroundColor: '#ffffff',
        borderRadius: '0px',
        boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '25px 19px',
        zIndex: 100,
        transition: 'width 0.3s ease',
      }}
    >
      {/* Menu Toggle Button - aligned with header */}
      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={onToggle}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40px',
            height: '40px',
            border: '0',
            boxSizing: 'border-box',
            borderRadius: '8px',
            boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
            color: 'var(--theme-primary)',
            backgroundColor: 'var(--theme-primary-dark)',
            outline: 'none',
          }}
        >
          <MenuIcon color="var(--theme-primary)" />
        </button>
      </div>

      {/* Expand/Collapse Indicator - positioned at sidebar edge */}
      <button
        onClick={onToggle}
        style={{
          cursor: 'pointer',
          position: 'absolute',
          top: '35px',
          right: '-10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '20px',
          height: '20px',
          border: '0',
          boxSizing: 'border-box',
          borderRadius: '8px',
          boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
          backgroundColor: 'var(--theme-primary)',
          outline: 'none',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          zIndex: 101,
        }}
      >
        <ChevronIcon color="var(--theme-primary-dark)" />
      </button>

      {/* Navigation Buttons */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {menuItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
          />
        ))}
      </nav>

      {/* Action Buttons - Fixed at bottom */}
      {/* New Task Button */}
      <button
        onClick={onNewTask}
        style={{
          cursor: 'pointer',
          width: isExpanded ? '220px' : '46px',
          height: '46px',
          padding: isExpanded ? '0px 16px' : '0px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: isExpanded ? '12px' : '0',
          border: '0',
          boxSizing: 'border-box',
          borderRadius: '8px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: 'var(--theme-primary)',
          color: 'var(--theme-primary-dark)',
          outline: 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
        title="New Task"
      >
        <PlusIcon color="var(--theme-primary-dark)" />
        {isExpanded && (
          <span
            style={{
              color: 'var(--theme-primary-dark)',
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            New Task
          </span>
        )}
      </button>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          cursor: loading ? 'not-allowed' : 'pointer',
          width: isExpanded ? '220px' : '46px',
          height: '46px',
          padding: isExpanded ? '0px 16px' : '0px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: isExpanded ? '12px' : '0',
          border: '0',
          boxSizing: 'border-box',
          borderRadius: '8px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: 'var(--theme-primary-dark)',
          color: 'var(--theme-primary)',
          outline: 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
        title="Refresh"
      >
        <div style={{
          animation: loading ? 'spin 1s linear infinite' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <RefreshIcon color="var(--theme-primary)" />
        </div>
        {isExpanded && (
          <span
            style={{
              color: 'var(--theme-primary)',
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Refresh
          </span>
        )}
      </button>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        style={{
          cursor: 'pointer',
          width: isExpanded ? '220px' : '46px',
          height: '46px',
          padding: isExpanded ? '0px 16px' : '0px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: isExpanded ? '12px' : '0',
          border: '0',
          boxSizing: 'border-box',
          borderRadius: '8px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
          backgroundColor: 'var(--theme-primary)',
          color: '#000000',
          outline: 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
        title="Log out"
      >
        <LogoutIcon color="#000000" />
        {isExpanded && (
          <span
            style={{
              color: '#000000',
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Log out
          </span>
        )}
      </button>
    </aside>
  );
}
