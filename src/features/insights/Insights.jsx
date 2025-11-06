import React from 'react';

export default function Insights() {
  return (
    <div className="max-w-7xl mx-auto" style={{ paddingTop: '24px' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          fontFamily: 'Poppins',
          color: 'var(--theme-primary-dark)',
          marginBottom: '8px'
        }}>
          Insights
        </h1>
        <p style={{
          fontSize: '16px',
          fontFamily: 'Poppins',
          color: '#64748b'
        }}>
          Discover patterns and trends in your productivity
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="grid gap-6">
        {/* Coming Soon Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--theme-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8c-1.45 0-2.26 1.44-1.93 2.51l-3.55 3.56c-.3-.09-.74-.09-1.04 0l-2.55-2.55C12.27 10.45 11.46 9 10 9c-1.45 0-2.27 1.44-1.93 2.52l-4.56 4.55C2.44 15.74 1 16.55 1 18c0 1.1.9 2 2 2 1.45 0 2.26-1.44 1.93-2.51l4.55-4.56c.3.09.74.09 1.04 0l2.55 2.55C12.73 16.55 13.54 18 15 18c1.45 0 2.27-1.44 1.93-2.52l3.56-3.55c1.07.33 2.51-.48 2.51-1.93 0-1.1-.9-2-2-2z" />
              <path d="m15 9 .94-2.07L18 6l-2.06-.93L15 3l-.92 2.07L12 6l2.08.93zM3.5 11 4 9l2-.5L4 8l-.5-2L3 8l-2 .5L3 9z" />
            </svg>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            fontFamily: 'Poppins',
            color: 'var(--theme-primary-dark)',
            marginBottom: '12px'
          }}>
            Coming Soon
          </h2>

          <p style={{
            fontSize: '16px',
            fontFamily: 'Poppins',
            color: '#64748b',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            We're building powerful insights to help you understand your work patterns,
            track productivity trends, and optimize your task management workflow.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Productivity Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '8px'
            }}>
              Productivity Trends
            </h3>
            <p style={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              Visualize your task completion patterns over time with interactive charts and graphs.
            </p>
          </div>

          {/* Time Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '8px'
            }}>
              Time Analysis
            </h3>
            <p style={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              Understand where your time goes with detailed breakdowns by project and priority.
            </p>
          </div>

          {/* Goal Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '8px'
            }}>
              Goal Progress
            </h3>
            <p style={{
              fontSize: '14px',
              fontFamily: 'Poppins',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              Track your progress toward daily and weekly goals with milestone celebrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
