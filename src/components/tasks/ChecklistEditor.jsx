import React, { useState, useEffect } from "react";
import { Check, X, Plus, Trash2, ChevronUp, ChevronDown, Edit } from "../ui/icons";

/**
 * ChecklistEditor Component
 *
 * A reusable component for creating, editing, and managing checklists.
 * Supports add, remove, edit, reorder, and toggle completion.
 *
 * Props:
 * - checklist: Object with itemId keys and item objects (Microsoft Planner format)
 * - onChange: Callback when checklist changes (receives full checklist object)
 * - readOnly: If true, only shows checkboxes (no add/edit/remove)
 * - editable: If false, can only check/uncheck (default: true)
 */
export default function ChecklistEditor({ checklist = {}, onChange, readOnly = false, editable = true }) {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Convert checklist object to sorted array
  useEffect(() => {
    const itemsArray = Object.entries(checklist).map(([id, item]) => ({
      id,
      ...item
    }));

    // Sort by orderHint using proper string comparison
    itemsArray.sort((a, b) => {
      const orderA = a.orderHint || '';
      const orderB = b.orderHint || '';
      return orderA.localeCompare(orderB);
    });

    setItems(itemsArray);
  }, [checklist]);

  // Generate a new orderHint between two items or at the end
  const generateOrderHint = (prevOrderHint = '', nextOrderHint = '') => {
    if (!prevOrderHint && !nextOrderHint) {
      // First item
      return ' !';
    }
    if (!nextOrderHint) {
      // Last item - append to previous
      return `${prevOrderHint}!`;
    }
    if (!prevOrderHint) {
      // First item when items exist - prepend
      return ` ${nextOrderHint}`;
    }
    // Between two items - use midpoint logic
    return `${prevOrderHint} !`;
  };

  // Generate a unique ID for new items
  const generateItemId = () => {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle adding a new item
  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newId = generateItemId();
    const lastOrderHint = items.length > 0 ? items[items.length - 1].orderHint : '';
    const orderHint = generateOrderHint(lastOrderHint, '');

    const newItem = {
      '@odata.type': '#microsoft.graph.plannerChecklistItem',
      title: newItemText.trim(),
      isChecked: false,
      orderHint: orderHint
    };

    const updatedChecklist = {
      ...checklist,
      [newId]: newItem
    };

    onChange(updatedChecklist);
    setNewItemText('');
  };

  // Handle removing an item
  const handleRemoveItem = (itemId) => {
    const updatedChecklist = { ...checklist };
    delete updatedChecklist[itemId];
    onChange(updatedChecklist);
  };

  // Handle toggling completion
  const handleToggleComplete = (itemId) => {
    const item = checklist[itemId];
    const updatedChecklist = {
      ...checklist,
      [itemId]: {
        ...item,
        isChecked: !item.isChecked
      }
    };
    onChange(updatedChecklist);
  };

  // Handle editing item text
  const handleStartEdit = (itemId, currentText) => {
    setEditingItemId(itemId);
    setEditingText(currentText);
  };

  const handleSaveEdit = (itemId) => {
    if (!editingText.trim()) {
      // If empty, remove the item
      handleRemoveItem(itemId);
      setEditingItemId(null);
      return;
    }

    const item = checklist[itemId];
    const updatedChecklist = {
      ...checklist,
      [itemId]: {
        ...item,
        title: editingText.trim()
      }
    };
    onChange(updatedChecklist);
    setEditingItemId(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  // Handle reordering items
  const handleMoveUp = (index) => {
    if (index === 0) return;

    const currentItem = items[index];
    const prevItem = items[index - 1];
    const prevPrevItem = index > 1 ? items[index - 2] : null;

    // Generate new orderHint between prevPrev and prev
    const newOrderHint = generateOrderHint(
      prevPrevItem ? prevPrevItem.orderHint : '',
      prevItem.orderHint
    );

    const updatedChecklist = {
      ...checklist,
      [currentItem.id]: {
        ...checklist[currentItem.id],
        orderHint: newOrderHint
      }
    };

    onChange(updatedChecklist);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;

    const currentItem = items[index];
    const nextItem = items[index + 1];
    const nextNextItem = index < items.length - 2 ? items[index + 2] : null;

    // Generate new orderHint between next and nextNext
    const newOrderHint = generateOrderHint(
      nextItem.orderHint,
      nextNextItem ? nextNextItem.orderHint : ''
    );

    const updatedChecklist = {
      ...checklist,
      [currentItem.id]: {
        ...checklist[currentItem.id],
        orderHint: newOrderHint
      }
    };

    onChange(updatedChecklist);
  };

  // Read-only view (for Focus Mode)
  if (readOnly) {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={() => handleToggleComplete(item.id)}
              className="w-4 h-4 mt-0.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span className={`text-sm flex-1 ${item.isChecked ? 'line-through text-slate-500' : 'text-slate-700 font-medium'}`}>
              {item.title}
            </span>
          </label>
        ))}
      </div>
    );
  }

  // Full editor view
  return (
    <div className="space-y-3">
      {/* Checklist Items */}
      {items.map((item, index) => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={item.isChecked}
            onChange={() => handleToggleComplete(item.id)}
            className="w-4 h-4 mt-1 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
          />

          {/* Item Text / Edit Input */}
          {editingItemId === item.id ? (
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit(item.id);
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <span className={`flex-1 text-sm mt-1 ${item.isChecked ? 'line-through text-slate-500' : 'text-slate-700'}`}>
              {item.title}
            </span>
          )}

          {/* Action Buttons */}
          {editable && (
            <div className="flex items-center gap-1">
              {editingItemId === item.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item.id, item.title)}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add New Item */}
      {editable && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
            placeholder="Add checklist item..."
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={!newItemText.trim()}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      )}

      {/* Progress Counter */}
      {items.length > 0 && (
        <div className="pt-2 text-xs text-slate-500">
          {items.filter(item => item.isChecked).length} of {items.length} completed
        </div>
      )}
    </div>
  );
}
