// src/components/tasks/EditTaskModal.jsx
import React, { useState, useEffect } from "react";

/**
 * Graph-compliant EditTaskModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - accessToken: string
 *  - task: full task object from Graph
 *  - plan: full plan object (includes planId and name)
 *  - buckets: object or array of available buckets {id, name}
 */
export default function EditTaskModal({
  isOpen,
  onClose,
  accessToken,
  task,
  plan,
  buckets = {},
}) {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(
    task.dueDateTime
      ? new Date(task.dueDateTime).toISOString().split("T")[0]
      : ""
  );
  const [priority, setPriority] = useState(task.priority || 5);
  const [bucketId, setBucketId] = useState(task.bucketId || "");
  const [assignees, setAssignees] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState(
    Object.keys(task.assignments || {})
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch plan members for the Assigned To dropdown
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const res = await fetch(
          `https://graph.microsoft.com/v1.0/planner/plans/${plan.id}/details`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await res.json();
        const sharedIds = Object.keys(data.sharedWith || {});
        if (sharedIds.length > 0) {
          const userPromises = sharedIds.map((id) =>
            fetch(`https://graph.microsoft.com/v1.0/users/${id}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }).then((r) => r.json())
          );
          const users = await Promise.all(userPromises);
          setAssignees(users);
        }
      } catch (err) {
        console.error("Failed to fetch plan assignees:", err);
      }
    };
    fetchAssignees();
  }, [plan, accessToken]);

  const handleToggleAssignee = (id) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      // Build Graph payloads
      const taskPatch = {
        title: title.trim(),
        priority,
        dueDateTime: dueDate ? new Date(dueDate).toISOString() : null,
        bucketId: bucketId || null,
      };

      const detailsPatch = {
        description: description,
      };

      // Update core task
      await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "If-Match": task["@odata.etag"] || "*",
        },
        body: JSON.stringify(taskPatch),
      });

      // Update description
      await fetch(
        `https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "If-Match": task.detailsEtag || "*",
          },
          body: JSON.stringify(detailsPatch),
        }
      );

      // Update assignments (if changed)
      const assignments = {};
      selectedAssignees.forEach((id, i) => {
        assignments[id] = {
          "@odata.type": "microsoft.graph.plannerAssignment",
          orderHint: `!${"!".repeat(i + 1)}`,
        };
      });

      await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "If-Match": task["@odata.etag"] || "*",
        },
        body: JSON.stringify({ assignments }),
      });

      onClose?.();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to save changes. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  // Normalize buckets (object or array)
  const bucketList = Array.isArray(buckets)
    ? buckets
    : Object.entries(buckets).map(([id, b]) => ({ id, name: b.name || id }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          <strong>Plan:</strong> {plan?.title || plan?.name || plan?.id}
        </p>

        {error && (
          <div className="mb-3 rounded border border-red-300 bg-red-50 text-red-700 p-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full min-h-24 rounded border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            >
              <option value={1}>Urgent</option>
              <option value={3}>Important</option>
              <option value={5}>Medium</option>
              <option value={9}>Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bucket</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={bucketId}
              onChange={(e) => setBucketId(e.target.value)}
            >
              {bucketList.length === 0 && <option>No buckets</option>}
              {bucketList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Assigned To</label>
            <div className="max-h-40 overflow-auto rounded border p-2">
              {assignees.length === 0 ? (
                <div className="text-gray-500 text-sm">No members found</div>
              ) : (
                assignees.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(user.id)}
                      onChange={() => handleToggleAssignee(user.id)}
                    />
                    <span className="text-sm">{user.displayName}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}