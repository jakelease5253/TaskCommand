import React, { useState, useEffect } from 'react';
import { X, Users } from '../ui/icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function BulkAssigneeModal({
  isOpen,
  selectedTaskIds,
  tasks,
  plans,
  accessToken,
  onClose,
  onAssign
}) {
  const { theme } = useTheme();
  const colors = theme.colors;
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
    onAssign(selectedTaskIds, selectedUserIds);
    onClose();
  };

  const handleClearAll = () => {
    onAssign(selectedTaskIds, new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `2px solid ${colors.primary}`,
          backgroundColor: colors.primaryDark
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} style={{ color: colors.primaryDark }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  fontFamily: 'Poppins',
                  color: colors.primary,
                  margin: 0
                }}>Bulk Assign Users</h2>
                <p style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  color: colors.primary,
                  margin: 0,
                  marginTop: '2px'
                }}>
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
                      <p style={{
                        fontSize: '11px',
                        fontFamily: 'Poppins',
                        color: colors.primary,
                        opacity: 0.8,
                        margin: 0,
                        marginTop: '4px'
                      }}>
                        From: {Array.from(planNames).join(', ')}
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: colors.primary,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ color: colors.primaryDark }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Poppins',
                color: colors.text,
                marginBottom: '12px'
              }}>
                Select Users to Assign
              </label>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: `4px solid ${colors.primary}`,
                    borderTop: '4px solid transparent',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: colors.textSecondary
                  }}>Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 0',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.textSecondary
                }}>
                  No users found
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {users.map((user) => (
                    <label
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        backgroundColor: selectedUserIds.has(user.id) ? colors.primaryLight : 'transparent'
                      }}
                      onMouseOver={(e) => {
                        if (!selectedUserIds.has(user.id)) {
                          e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!selectedUserIds.has(user.id)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: colors.primaryDark
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          fontFamily: 'Poppins',
                          color: colors.text
                        }}>
                          {user.displayName}
                        </div>
                        {user.userPrincipalName && (
                          <div style={{
                            fontSize: '12px',
                            fontFamily: 'Poppins',
                            color: colors.textSecondary
                          }}>
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

          <div style={{
            borderTop: `1px solid ${colors.borderLight}`,
            padding: '24px',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'white',
                color: colors.text,
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Clear All Assignees
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'white',
                color: colors.text,
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                backgroundColor: !loading ? colors.primaryDark : colors.disabled,
                color: !loading ? colors.primary : colors.textLight,
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: '600',
                cursor: !loading ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.2s',
                opacity: !loading ? 1 : 0.6
              }}
              onMouseOver={(e) => { if (!loading) e.target.style.opacity = '0.9'; }}
              onMouseOut={(e) => { if (!loading) e.target.style.opacity = '1'; }}
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
