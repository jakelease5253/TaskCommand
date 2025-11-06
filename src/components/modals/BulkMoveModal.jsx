import React, { useState } from 'react';
import { X, Folder } from '../ui/icons';

export default function BulkMoveModal({
  isOpen,
  selectedTaskIds,
  plans,
  buckets,
  onClose,
  onMove
}) {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPlanId && selectedBucketId) {
      onMove(selectedPlanId, selectedBucketId);
      onClose();
    }
  };

  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
    setSelectedBucketId(''); // Reset bucket when plan changes
  };

  const availableBuckets = selectedPlanId ? (buckets[selectedPlanId] || []) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Move Tasks</h2>
            <p className="text-sm text-slate-600 mt-1">
              Moving {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Plan
            </label>
            <select
              value={selectedPlanId}
              onChange={handlePlanChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a plan...</option>
              {Object.entries(plans).map(([planId, planName]) => (
                <option key={planId} value={planId}>
                  {planName}
                </option>
              ))}
            </select>
          </div>

          {/* Bucket Selection */}
          {selectedPlanId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Bucket
              </label>
              {availableBuckets.length > 0 ? (
                <select
                  value={selectedBucketId}
                  onChange={(e) => setSelectedBucketId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a bucket...</option>
                  {availableBuckets.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-slate-500 py-2">
                  No buckets available in this plan
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPlanId || !selectedBucketId}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Move Tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
