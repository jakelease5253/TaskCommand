import { GripVertical, ChevronUp, ChevronDown, Target, Edit, Check, Folder, Calendar, Users, AlertCircle, Plus } from '../ui/icons';

export default function TaskList({
  tasks,
  sortMode,
  setSortMode,
  plans,
  buckets,
  userProfiles,
  focusTask,
  draggedTask,
  loading,
  onSetFocus,
  onEdit,
  onComplete,
  onDragStart,
  onDragOver,
  onDragEnd,
  moveTaskUp,
  moveTaskDown,
  onNewTask
}) {
  const getBucketName = (task) => {
    const planBuckets = buckets[task.planId] || [];
    const bucket = planBuckets.find(b => b.id === task.bucketId);
    return bucket ? bucket.name : 'No Bucket';
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Urgent', 3: 'Important', 5: 'Medium', 9: 'Low' };
    return labels[priority] || 'Medium';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'bg-red-100 text-red-700',
      3: 'bg-orange-100 text-orange-700',
      5: 'bg-blue-100 text-blue-700',
      9: 'bg-slate-100 text-slate-700'
    };
    return colors[priority] || 'bg-blue-100 text-blue-700';
  };

  const isOverdue = (task) => {
    if (!task.dueDateTime) return false;
    const dueDateStr = task.dueDateTime.split('T')[0];
    const dueDate = new Date(dueDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.percentComplete < 100;
  };

  const getDaysUntilDue = (task) => {
    if (!task.dueDateTime) return null;
    const dueDate = new Date(task.dueDateTime);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Check />
        </div>
        <h3 className="text-xl font-medium text-slate-800 mb-2">No active tasks</h3>
        <p className="text-slate-600 mb-6">Create a new task to get started</p>
        <button
          onClick={onNewTask}
          className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg"
        >
          <Plus />
          Create First Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task List Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Your Tasks
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
              </span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="myOrder">My Order</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
            
            {/* New Task Button */}
            <button
              onClick={onNewTask}
              className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
            >
              <Plus />
              New Task
            </button>
          </div>
        </div>
      </div>
      
      {/* Task Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      ) : (
        <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          draggable={sortMode === 'myOrder'}
          onDragStart={() => onDragStart(task)}
          onDragOver={(e) => onDragOver(e, task)}
          onDragEnd={onDragEnd}
          className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md ${
            focusTask?.id === task.id ? 'ring-2 ring-offset-0' : ''
          } ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}
          style={
            focusTask?.id === task.id
              ? { borderColor: '#3b82f6', boxShadow: '0 0 0 2px #3b82f6' }
              : {}
          }
        >
          <div className="flex items-start gap-4">
            {/* Drag and Drop Controls (only in myOrder mode) */}
            {sortMode === 'myOrder' && (
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => moveTaskUp(task)}
                  disabled={index === 0}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp />
                </button>
                <div className="cursor-move text-slate-400 hover:text-slate-600">
                  <GripVertical />
                </div>
                <button
                  onClick={() => moveTaskDown(task)}
                  disabled={index === tasks.length - 1}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown />
                </button>
              </div>
            )}

            {/* Task Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {/* Task Title */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {task.title}
                  </h3>

                  {/* Task Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    {/* Plan Name */}
                    <span className="flex items-center gap-1">
                      <Folder />
                      {plans[task.planId]}
                    </span>

                    {/* Bucket Name */}
                    <span className="flex items-center gap-1">
                      {getBucketName(task)}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </span>

                    {/* Due Date */}
                    {task.dueDateTime && (
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue(task) ? 'text-red-600 font-medium' : ''
                        }`}
                      >
                        <Calendar />
                        {new Date(task.dueDateTime).toLocaleDateString()}
                        {getDaysUntilDue(task) !== null && (
                          <span className="text-xs">
                            ({getDaysUntilDue(task)} days)
                          </span>
                        )}
                      </span>
                    )}

                    {/* Assigned Users */}
                    {task.assignments && Object.keys(task.assignments).length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users />
                        {Object.keys(task.assignments)
                          .map((userId) => userProfiles[userId] || 'Unknown')
                          .join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Focus Button */}
                  <button
                    onClick={() => onSetFocus(task)}
                    className={`p-2 rounded-lg transition-colors ${
                      focusTask?.id === task.id
                        ? 'gradient-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={
                      focusTask?.id === task.id
                        ? 'Stop focusing'
                        : 'Focus on this task'
                    }
                  >
                    <Target />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(task)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Edit />
                  </button>

                  {/* Complete Button */}
                  <button
                    onClick={() => onComplete(task.id)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Check />
                  </button>
                </div>
              </div>

              {/* Overdue Warning */}
              {isOverdue(task) && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle />
                  <span className="font-medium">Overdue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
        </div>
      )}
    </div>
  );
}