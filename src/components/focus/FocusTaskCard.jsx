import React from "react";
import { Target, Calendar, Clock, Folder, Edit, Check } from "../ui/icons";

export default function FocusTaskCard({
  title,
  planName,
  bucketName,
  elapsedText,
  dueText, // e.g., "Due today" or "Due in 2d"
  onEdit,
  onMarkDone,
}) {
  return (
    <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full animate-pulse gradient-primary" />
            <h3 className="text-lg font-semibold text-slate-800">
              Current Focus Task
            </h3>
          </div>
          <h4 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {planName && (
              <span className="flex items-center gap-1">
                <Folder />
                {planName}
              </span>
            )}
            {bucketName && <span>{bucketName}</span>}
            {dueText && (
              <span className="inline-flex items-center gap-1">
                <Calendar /> {dueText}
              </span>
            )}
            {elapsedText && (
              <span className="inline-flex items-center gap-1">
                <Clock /> {elapsedText}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onEdit} className="p-2 hover:bg-slate-100 rounded-lg">
            <Edit />
          </button>
          <button
            type="button"
            onClick={onMarkDone}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <Check />
            <span className="ml-2">Mark Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
