import React from 'react';

export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full h-2 bg-slate-200 rounded">
      <div
        className="h-2 bg-blue-600 rounded"
        style={{ width: `${pct}%`, transition: 'width .2s ease' }}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      />
    </div>
  );
}
