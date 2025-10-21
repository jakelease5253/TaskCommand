import React from "react";
import { GripVertical, Edit, X, Calendar, Folder } from "../ui/icons";

export default function TaskCard({
  title,
  planName,
  bucketName,
  priorityLabel,
  priorityColorClass, // e.g. "bg-indigo-50 text-indigo-700"
  dueDateText,
  isOverdue = false,
  isDone = false,
  onDragUp,
  onDragDown,
  onEdit,
  onDelete,
  onToggleComplete,
  showOrderControls = false,
}) {
  return (
    <div className={
      `p-3 bg-white rounded-lg shadow-sm border border-slate-200 ` +
      (isDone ? "opacity-60 " : "")
    }>
      <div className="flex items-start gap-4">
        {showOrderControls && (
          <div className="flex flex-col gap-1 pt-1">
            <button type="button" onClick={onDragUp} className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded">
              <GripVertical />
            </button>
            <button type="button" onClick={onDragDown} className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded">
              <GripVertical />
            </button>
          </div>
        )}

        <input
          type="checkbox"
          checked={isDone}
          onChange={onToggleComplete}
          className="mt-1"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={
              `font-medium ` + (isDone ? "line-through" : "")
            }>{title}</h4>
            {priorityLabel && (
              <span className={`text-xs px-2 py-0.5 rounded ${priorityColorClass}`}>{priorityLabel}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {planName && (
              <span className="flex items-center gap-1">
                <Folder />
                {planName}
              </span>
            )}
            {bucketName && <span className="flex items-center gap-1">{bucketName}</span>}
            {dueDateText && (
              <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                <Calendar />
                {dueDateText}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} className="icon-btn p-2 hover:bg-slate-100 rounded" title="Edit">
            <Edit />
          </button>
          <button type="button" onClick={onDelete} className="icon-btn p-2 hover:bg-slate-100 rounded" title="Delete">
            <X />
          </button>
        </div>
      </div>
    </div>
  );
}
