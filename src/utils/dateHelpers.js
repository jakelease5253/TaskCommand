export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const isOverdue = (task) => {
  if (!task.dueDateTime) return false;
  const dueDateStr = task.dueDateTime.split('T')[0];
  const dueDate = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today && task.percentComplete < 100;
};

export const getDaysUntilDue = (task) => {
  if (!task.dueDateTime) return null;
  const dueDate = new Date(task.dueDateTime);
  const today = new Date();
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};