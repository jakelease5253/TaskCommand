// src/components/focus/FocusTaskPanel.jsx
import React from 'react';
import FocusTaskCard from './FocusTaskCard';
import { useTaskDetails } from './useTaskDetails';

export default function FocusTaskPanel({ task, elapsed, planName, bucketName, onComplete, formatTime }) {
  const { enriched, loading, etag, error, setEnriched, setEtag } = useTaskDetails(task);

  // Optional: checklist toggle with optimistic update + ETag control
  async function handleToggleChecklist(task, item) {
    const next = (task.checklist || []).map(c =>
      c.id === item.id ? { ...c, isChecked: !c.isChecked } : c
    );
    setEnriched({ ...task, checklist: next });

    const res = await fetch(`/api/planner/tasks/${task.id}/checklist/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'If-Match': etag || '*',
      },
      body: JSON.stringify({ isChecked: !item.isChecked }),
    });

    if (res.status === 412) {
      // ETag mismatch — refetch details for latest state
      const fresh = await fetch(`/api/planner/tasks/${task.id}/details`).then(r => r.json());
      setEnriched({
        ...task,
        description: fresh?.description || '',
        checklist: (fresh?.checklist ? Object.entries(fresh.checklist).map(([id, v]) => ({
          id,
          title: v?.title ?? '',
          isChecked: !!v?.isChecked,
        })) : []),
      });
      setEtag(fresh?.['@odata.etag'] || null);
      return;
    }

    if (!res.ok) {
      // rollback on error
      const rollback = (task.checklist || []).map(c =>
        c.id === item.id ? { ...c, isChecked: item.isChecked } : c
      );
      setEnriched({ ...task, checklist: rollback });
      return;
    }

    try {
      const payload = await res.json();
      if (payload?.etag) setEtag(payload.etag);
    } catch {/* ok */}
  }

  return (
    <>
      <FocusTaskCard
        task={enriched}
        elapsed={elapsed}
        planName={planName}
        bucketName={bucketName}
        onComplete={onComplete}
        formatTime={formatTime}
        onToggleChecklist={handleToggleChecklist}
      />
      {loading && <div className="text-xs text-slate-500 mt-2">Loading details…</div>}
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </>
  );
}
