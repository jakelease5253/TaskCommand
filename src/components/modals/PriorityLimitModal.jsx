import React from 'react';
import { AlertCircle, X } from '../ui/icons';

export default function PriorityLimitModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Whoa there, multitasker! 🎯
          </h3>

          {/* Message */}
          <p className="text-slate-600 mb-2">
            Your priority queue is full (7/7 tasks).
          </p>
          <p className="text-slate-700 font-medium mb-6">
            Remember: <span className="text-indigo-600">Too many priorities means nothing gets done.</span>
          </p>

          {/* Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-900">
              <strong>💡 Pro tip:</strong> Focus on completing your current priorities before adding more. Remove a task from your queue to make room for this one.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 gradient-primary text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            Got it, I'll focus!
          </button>
        </div>
      </div>
    </div>
  );
}