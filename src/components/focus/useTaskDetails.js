// src/components/focus/useTaskDetails.js
import { useEffect, useState } from 'react';
import { mapPlannerChecklist } from './mapPlannerChecklist';
import { fetchTaskDetails } from '../../hooks/useTasks'; // or wherever you put the helper

export function useTaskDetails(task) {
  const [enriched, setEnriched] = useState(task);
  const [loading, setLoading] = useState(false);
  const [etag, setEtag] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!task?.id) return;
      setLoading(true);
      setError(null);
      try {
        const details = await fetchTaskDetails(task.id);
        const checklist = mapPlannerChecklist(details?.checklist);
        const merged = {
          ...task,
          description: details?.description || '',
          checklist,
          etag: details?.['@odata.etag'] || null,
        };
        if (alive) {
          setEnriched(merged);
          setEtag(merged.etag);
        }
      } catch (e) {
        if (alive) {
          setError(e.message || 'Failed to load task details');
          setEnriched({ ...task, checklist: [] });
        }
      } finally {
        alive && setLoading(false);
      }
    }
    setEnriched(task); // reset immediately when focus changes
    load();
    return () => { alive = false; };
  }, [task?.id]);

  return { enriched, loading, etag, error, setEnriched, setEtag };
}
