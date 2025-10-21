export const getPriorityLabel = (priority) => {
  const labels = { 1: 'Urgent', 3: 'Important', 5: 'Medium', 9: 'Low' };
  return labels[priority] || 'Medium';
};

export const getPriorityColor = (priority) => {
  const colors = {
    1: 'bg-red-100 text-red-700',
    3: 'bg-orange-100 text-orange-700',
    5: 'bg-blue-100 text-blue-700',
    9: 'bg-slate-100 text-slate-700'
  };
  return colors[priority] || 'bg-blue-100 text-blue-700';
};

export const sortTasks = (tasks, sortMode, customOrder) => {
  const incompleteTasks = tasks.filter(task => task.percentComplete < 100);
  
  switch (sortMode) {
    case 'myOrder':
      return incompleteTasks.sort((a, b) => {
        const indexA = customOrder.indexOf(a.id);
        const indexB = customOrder.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    case 'priority':
      return incompleteTasks.sort((a, b) => (a.priority || 5) - (b.priority || 5));
    case 'dueDate':
      return incompleteTasks.sort((a, b) => {
        if (!a.dueDateTime && !b.dueDateTime) return 0;
        if (!a.dueDateTime) return 1;
        if (!b.dueDateTime) return -1;
        return new Date(a.dueDateTime) - new Date(b.dueDateTime);
      });
    default:
      return incompleteTasks;
  }
};