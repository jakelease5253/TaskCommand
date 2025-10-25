export function mapPlannerChecklist(checklistObj) {
  if (!checklistObj || typeof checklistObj !== 'object') return [];
  return Object.entries(checklistObj).map(([id, v]) => ({
    id,
    title: v?.title ?? '',
    isChecked: !!v?.isChecked,
    orderHint: typeof v?.orderHint === 'string' ? v.orderHint : ''
  }));
}

// Planner's natural display order often corresponds to a lexicographic ordering of orderHint,
// but if your UI is showing the reverse, flip the comparator to match Planner exactly.
export function sortByOrderHint(items) {
  const arr = Array.isArray(items) ? items.slice() : [];
  arr.sort((a, b) => {
    const ah = a?.orderHint ?? '';
    const bh = b?.orderHint ?? '';
    // Flip to match Planner's on-screen ordering
    if (ah < bh) return 1;
    if (ah > bh) return -1;
    return 0;
  });
  return arr;
}
