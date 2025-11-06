import React, { useState, useEffect } from 'react';
import { X, Users } from '../ui/icons';

export default function BulkAssigneeModal({
  isOpen,
  selectedTaskIds,
  tasks,
  plans,
  accessToken,
  onClose,
  onAssign
}) {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchUsers();
    }
  }, [isOpen, accessToken]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get unique plan IDs from selected tasks only
      const planIds = new Set();
      selectedTaskIds.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.planId) {
          planIds.add(task.planId);
        }
      });

      const allUsers = new Map();

      for (const planId of planIds) {
        try {
          const planResponse = await fetch(
            `https://graph.microsoft.com/v1.0/planner/plans/${planId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          const planData = await planResponse.json();

          if (planData.owner) {
            const membersResponse = await fetch(
              `https://graph.microsoft.com/v1.0/groups/${planData.owner}/members`,
              { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            const membersData = await membersResponse.json();

            membersData.value?.forEach(user => {
              if (!allUsers.has(user.id)) {
                allUsers.set(user.id, {
                  id: user.id,
                  displayName: user.displayName || user.userPrincipalName,
                  userPrincipalName: user.userPrincipalName
                });
              }
            });
          }
        } catch (err) {
          console.error(`Failed to fetch users for plan ${planId}:`, err);
        }
      }

      setUsers(Array.from(allUsers.values()));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(selectedUserIds);
    onClose();
  };

  const handleClearAll = () => {
    onAssign(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Bulk Assign Users</h2>
            <p className="text-sm text-slate-600 mt-1">
              Assigning to {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? 's' : ''}
            </p>
            {(() => {
              const planNames = new Set();
              selectedTaskIds.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                if (task && task.planId && plans[task.planId]) {
                  planNames.add(plans[task.planId]);
                }
              });
              if (planNames.size > 0) {
                return (
                  <p className="text-xs text-slate-500 mt-1">
                    From: {Array.from(planNames).join(', ')}
                  </p>
                );
              }
            })()}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select Users to Assign
              </label>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  No users found
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">
                          {user.displayName}
                        </div>
                        {user.userPrincipalName && (
                          <div className="text-xs text-slate-500">
                            {user.userPrincipalName}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 p-6 flex gap-3">
            <button
              type="button"
              onClick={handleClearAll}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Clear All Assignees
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
