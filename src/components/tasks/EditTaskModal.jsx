import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "../ui/icons";
import ChecklistEditor from "./ChecklistEditor";

export default function EditTaskModal({
  task,
  accessToken,
  plans,
  buckets,
  onClose,
  onTaskUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskEtag, setTaskEtag] = useState(null);
  const [detailsEtag, setDetailsEtag] = useState(null);
  const [currentDescription, setCurrentDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(task.planId || '');
  const [selectedBucketId, setSelectedBucketId] = useState(task.bucketId || '');
  const [assignments, setAssignments] = useState({});
  const [users, setUsers] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [originalChecklist, setOriginalChecklist] = useState({});

  // Fetch the current task and details to get etags
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        // Fetch task to get its etag
        const taskResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const taskData = await taskResponse.json();
        setTaskEtag(taskData['@odata.etag']);
        setAssignments(taskData.assignments || {});

        // Update plan and bucket from fresh API data
        if (taskData.planId) {
          setSelectedPlanId(taskData.planId);
        }
        if (taskData.bucketId) {
          setSelectedBucketId(taskData.bucketId);
        }

        // Fetch task details to get its etag and description
        const detailsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const detailsData = await detailsResponse.json();
        setDetailsEtag(detailsData['@odata.etag']);
        const desc = detailsData.description || '';
        const checklistData = detailsData.checklist || {};
        setCurrentDescription(desc);
        setOriginalDescription(desc);
        setChecklist(checklistData);
        setOriginalChecklist(checklistData);

        // Fetch group members for assignment
        if (taskData.planId) {
          const planResponse = await fetch(
            `https://graph.microsoft.com/v1.0/planner/plans/${taskData.planId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          const planData = await planResponse.json();

          const membersResponse = await fetch(
            `https://graph.microsoft.com/v1.0/groups/${planData.owner}/members`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          const membersData = await membersResponse.json();
          setUsers(membersData.value || []);
        }
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError('Failed to load task data');
      }
    };

    if (task && accessToken) {
      fetchTaskData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, accessToken]); // Only depend on task.id, not the entire task object

  if (!task) return null;

  // Handle checklist changes (add, remove, edit, toggle)
  const handleChecklistChange = (updatedChecklist) => {
    // Just update local state - changes will be saved when form is submitted
    setChecklist(updatedChecklist);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const dueDate = formData.get('dueDate');
    const priority = parseInt(formData.get('priority'));
    const percentComplete = parseInt(formData.get('status'));
    const description = formData.get('description');

    try {
      // Clean up assignments - remove read-only properties
      const cleanedAssignments = {};
      Object.keys(assignments).forEach(userId => {
        if (assignments[userId]) {
          // Only include the required properties, not read-only ones like assignedBy
          cleanedAssignments[userId] = {
            '@odata.type': '#microsoft.graph.plannerAssignment',
            orderHint: ' !'
          };
        } else {
          // Set to null to remove assignment
          cleanedAssignments[userId] = null;
        }
      });

      // Update basic task properties (title, priority, percentComplete, due date, plan, bucket, assignments)
      const updateData = {
        title,
        priority,
        percentComplete,
        assignments: cleanedAssignments
      };

      // Add planId if changed
      if (selectedPlanId && selectedPlanId !== task.planId) {
        updateData.planId = selectedPlanId;
      }

      // Add bucket if changed (or if plan changed, must update bucket)
      if (selectedBucketId && (selectedBucketId !== task.bucketId || selectedPlanId !== task.planId)) {
        updateData.bucketId = selectedBucketId;
      }

      if (dueDate) {
        // Parse the date as local and set to noon UTC to avoid timezone issues
        const [year, month, day] = dueDate.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
        updateData.dueDateTime = date.toISOString();
      } else {
        updateData.dueDateTime = null; // Clear due date if empty
      }

      const taskResponse = await fetch(
        `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'If-Match': taskEtag
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json();
        throw new Error(errorData.error?.message || 'Failed to update task');
      }

      // Update description and/or checklist if changed
      const descriptionChanged = description !== originalDescription;
      const checklistChanged = JSON.stringify(checklist) !== JSON.stringify(originalChecklist);

      if (descriptionChanged || checklistChanged) {
        const detailsUpdate = {};
        if (descriptionChanged) {
          detailsUpdate.description = description;
        }
        if (checklistChanged) {
          detailsUpdate.checklist = checklist;
        }

        // Fetch fresh etag before updating details
        const freshDetailsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const freshDetailsData = await freshDetailsResponse.json();
        const freshDetailsEtag = freshDetailsData['@odata.etag'];

        const detailsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'If-Match': freshDetailsEtag
            },
            body: JSON.stringify(detailsUpdate)
          }
        );

        if (!detailsResponse.ok) {
          const errorData = await detailsResponse.json();
          throw new Error(errorData.error?.message || 'Failed to update task details');
        }
      }

      // Construct the updated task object to pass back for optimistic update
      const updatedTask = {
        ...task,
        title,
        priority,
        percentComplete,
        dueDateTime: updateData.dueDateTime,
        planId: updateData.planId || task.planId,
        bucketId: updateData.bucketId || task.bucketId,
        assignments: cleanedAssignments
      };

      // Call the callback if it exists, passing the updated task data
      if (typeof onTaskUpdated === 'function') {
        onTaskUpdated(updatedTask);
      } else {
        console.error('onTaskUpdated is not a function:', onTaskUpdated);
        // Close modal anyway
        onClose();
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle plan change
  const handlePlanChange = async (e) => {
    const planId = e.target.value;
    setSelectedPlanId(planId);
    // Reset bucket when plan changes
    setSelectedBucketId('');
    // Clear assignments when plan changes (users from old plan won't be in new plan)
    setAssignments({});

    // Fetch users for the new plan
    if (planId && accessToken) {
      try {
        const planResponse = await fetch(
          `https://graph.microsoft.com/v1.0/planner/plans/${planId}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const planData = await planResponse.json();

        const membersResponse = await fetch(
          `https://graph.microsoft.com/v1.0/groups/${planData.owner}/members`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const membersData = await membersResponse.json();
        setUsers(membersData.value || []);
      } catch (err) {
        console.error('Error fetching users for new plan:', err);
        setUsers([]);
      }
    } else {
      setUsers([]);
    }
  };

  // Handle assignment toggle
  const toggleAssignment = (userId) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      if (newAssignments[userId]) {
        delete newAssignments[userId];
      } else {
        newAssignments[userId] = {
          '@odata.type': '#microsoft.graph.plannerAssignment',
          orderHint: ' !'
        };
      }
      return newAssignments;
    });
  };

  // Get buckets for selected plan (buckets is an object with planId as keys)
  const filteredBuckets = selectedPlanId ? (buckets?.[selectedPlanId] || []) : [];

  // Convert plans object to array for dropdown
  const plansArray = plans ? Object.entries(plans).map(([id, title]) => ({ id, title })) : [];

  // Check if plans/buckets data is loaded
  const isDataLoaded = plansArray.length > 0;

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
            }}>Edit Task</h2>
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

          {!isDataLoaded && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5"><AlertCircle /></div>
              <p className="text-sm text-blue-800">Loading plans and buckets data...</p>
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
            }}>
              Task Title *
            </label>
            <input
              name="title"
              type="text"
              defaultValue={task.title}
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
            }}>
              Description
            </label>
            <textarea
              name="description"
              defaultValue={currentDescription}
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
              rows="4"
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
                onChange={handleChecklistChange}
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
              }}>
                Plan *
              </label>
              <select
                value={selectedPlanId}
                onChange={handlePlanChange}
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
                {plansArray.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
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
              }}>
                Bucket
              </label>
              <select
                value={selectedBucketId}
                onChange={(e) => setSelectedBucketId(e.target.value)}
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
                {filteredBuckets.map(bucket => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.name}
                  </option>
                ))}
              </select>
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
              }}>
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                defaultValue={formatDateForInput(task.dueDateTime)}
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
              }}>
                Priority
              </label>
              <select
                name="priority"
                defaultValue={task.priority || 5}
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
              >
                <option value="1">Urgent</option>
                <option value="3">Important</option>
                <option value="5">Medium</option>
                <option value="9">Low</option>
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
            }}>
              Status
            </label>
            <select
              name="status"
              defaultValue={task.percentComplete === 100 ? '100' : task.percentComplete > 0 ? '50' : '0'}
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
            >
              <option value="0">Not Started</option>
              <option value="50">In Progress</option>
              <option value="100">Completed</option>
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
            }}>
              Assign To
            </label>
            <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <p style={{
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  color: '#64748b'
                }}>No users available</p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!assignments[user.id]}
                        onChange={() => toggleAssignment(user.id)}
                        className="w-4 h-4 border-slate-300 rounded"
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{
                        fontSize: '14px',
                        fontFamily: 'Poppins',
                        color: 'var(--theme-primary-dark)'
                      }}>
                        {user.displayName || user.userPrincipalName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
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
              disabled={loading || !taskEtag || !detailsEtag || !isDataLoaded}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: (loading || !taskEtag || !detailsEtag || !isDataLoaded) ? '#94a3b8' : 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                border: 'none',
                borderRadius: '8px',
                cursor: (loading || !taskEtag || !detailsEtag || !isDataLoaded) ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '14px',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => !(loading || !taskEtag || !detailsEtag || !isDataLoaded) && (e.target.style.opacity = '0.9')}
              onMouseOut={(e) => !(loading || !taskEtag || !detailsEtag || !isDataLoaded) && (e.target.style.opacity = '1')}
            >
              {loading ? "Updating..." : !isDataLoaded ? "Loading..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}