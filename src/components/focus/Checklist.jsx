import React, { useRef } from 'react';

export default function Checklist({ items = [], onToggle, onReorder }) {
  const dragIndex = useRef(null);
  const overIndex = useRef(null);

  function handleDragStart(index) {
    dragIndex.current = index;
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    overIndex.current = index;
  }

  function handleDrop(e) {
    e.preventDefault();
    const from = dragIndex.current;
    const to = overIndex.current;
    dragIndex.current = null;
    overIndex.current = null;

    if (from == null || to == null || from === to) return;
    if (!Array.isArray(items) || items.length === 0) return;

    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    // Hand control back to parent
    onReorder?.(next);
  }

  if (!items?.length) {
    return <div className="text-sm text-slate-500">No checklist items</div>;
  }

  return (
    <ul className="mt-3 space-y-2">
      {items.map((it, idx) => (
        <li
          key={it.id}
          className="flex items-start gap-2 bg-white cursor-move"
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={handleDrop}
        >
          <input
            type="checkbox"
            className="mt-0.5"
            checked={!!it.isChecked}
            onChange={() => onToggle?.(it)}
          />
          <span className={it.isChecked ? 'line-through text-slate-500' : ''}>
            {it.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
