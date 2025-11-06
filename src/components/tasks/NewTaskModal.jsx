import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "../ui/icons";
import ChecklistEditor from "./ChecklistEditor";

export default function NewTaskModal({
  accessToken,
  plans = {},
  buckets = {},
  currentUserId,
  onClose,
  onTaskCreated,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [availableBuckets, setAvailableBuckets] = useState([]);
  const [planMembers, setPlanMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [checklist, setChecklist] = useState({});

  // Update available buckets when plan changes
  useEffect(() => {
    if (selectedPlanId && buckets[selectedPlanId]) {
      setAvailableBuckets(buckets[selectedPlanId]);
    } else {
      setAvailableBuckets([]);
    }
  }, [selectedPlanId, buckets]);

  // Fetch plan members when plan changes
  useEffect(() => {
    if (selectedPlanId) {
      fetchPlanMembers(selectedPlanId);
    } else {
      setPlanMembers([]);
    }
  }, [selectedPlanId, accessToken]);

  const fetchPlanMembers = async (planId) => {
    setLoadingMembers(true);
    try {
      // First, get the group ID associated with the plan
      const planResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/plans/${planId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const plan = await planResponse.json();
      const groupId = plan.owner;

      // Then get the members of that group
      const membersResponse = await fetch(`https://graph.microsoft.com/v1.0/groups/${groupId}/members`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const membersData = await membersResponse.json();

      setPlanMembers(membersData.value || []);
    } catch (err) {
      console.error('Error fetching plan members:', err);
      setPlanMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const planId = formData.get('planId');
    const bucketId = formData.get('bucketId');
    const dueDate = formData.get('dueDate');
    const priority = parseInt(formData.get('priority'));
    const assignedToUserId = formData.get('assignedTo');

    try {
      // Create task
      const taskData = {
        planId,
        title,
      };

      // Only include bucketId if one is selected
      if (bucketId) {
        taskData.bucketId = bucketId;
      }

      if (dueDate) {
        // Parse the date as local and set to noon UTC to avoid timezone issues
        const [year, month, day] = dueDate.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
        taskData.dueDateTime = date.toISOString();
      }

      if (priority) {
        taskData.priority = priority;
      }

      // Add assignment if a user is selected
      if (assignedToUserId) {
        taskData.assignments = {
          [assignedToUserId]: {
            "@odata.type": "#microsoft.graph.plannerAssignment",
            orderHint: " !"
          }
        };
      }

      const response = await fetch('https://graph.microsoft.com/v1.0/planner/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create task');
      }

      const newTask = await response.json();

      // If there's a description or checklist, update task details
      if (description || Object.keys(checklist).length > 0) {
        const detailsResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${newTask.id}/details`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const details = await detailsResponse.json();

        const detailsUpdate = {};
        if (description) {
          detailsUpdate.description = description;
        }
        if (Object.keys(checklist).length > 0) {
          detailsUpdate.checklist = checklist;
        }

        const detailsUpdateResponse = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${newTask.id}/details`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'If-Match': details['@odata.etag']
          },
          body: JSON.stringify(detailsUpdate)
        });

        if (!detailsUpdateResponse.ok) {
          const errorData = await detailsUpdateResponse.json();
          throw new Error(errorData.error?.message || 'Failed to update task details');
        }
      }

      onTaskCreated(newTask);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div style={{
          padding: '24px',
          borderBottom: '2px solid var(--theme-primary)',
          backgroundColor: 'var(--theme-primary-dark)'
        }}>
          <div className="flex items-center justify-between">
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary)',
              margin: 0
            }}>Create New Task</h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: 'var(--theme-primary)',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ color: 'var(--theme-primary-dark)' }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5"><AlertCircle /></div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '8px'
            }}>Task Title *</label>
            <input
              name="title"
              type="text"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '8px'
            }}>Description</label>
            <textarea
              name="description"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          {/* Checklist Section */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '8px'
            }}>
              Checklist
            </label>
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
              <ChecklistEditor
                checklist={checklist}
                onChange={setChecklist}
                editable={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: 'Poppins',
                color: 'var(--theme-primary-dark)',
                marginBottom: '8px'
              }}>Plan *</label>
              <select
                name="planId"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                required
              >
                <option value="">Select a plan</option>
                {Object.entries(plans).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: 'Poppins',
                color: 'var(--theme-primary-dark)',
                marginBottom: '8px'
              }}>Bucket</label>
              <select
                name="bucketId"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                disabled={!selectedPlanId}
              >
                <option value="">Select a bucket (optional)</option>
                {availableBuckets.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>{bucket.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '8px'
            }}>Assign To</label>
            <select
              name="assignedTo"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
              disabled={!selectedPlanId || loadingMembers}
              defaultValue={currentUserId || ""}
            >
              <option value="">Unassigned</option>
              {planMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName || member.userPrincipalName}
                </option>
              ))}
            </select>
            {loadingMembers && (
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                fontFamily: 'Poppins',
                marginTop: '4px'
              }}>Loading members...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: 'Poppins',
                color: 'var(--theme-primary-dark)',
                marginBottom: '8px'
              }}>Due Date</label>
              <input
                name="dueDate"
                type="date"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: 'Poppins',
                color: 'var(--theme-primary-dark)',
                marginBottom: '8px'
              }}>Priority</label>
              <select
                name="priority"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                defaultValue="5"
              >
                <option value="1">Urgent</option>
                <option value="3">Important</option>
                <option value="5">Medium</option>
                <option value="9">Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                color: 'var(--theme-primary-dark)',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: loading ? '#94a3b8' : 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '14px',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => !loading && (e.target.style.opacity = '0.9')}
              onMouseOut={(e) => !loading && (e.target.style.opacity = '1')}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}