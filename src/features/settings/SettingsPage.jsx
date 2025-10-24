// src/features/settings/SettingsPage.jsx
import React, { useState } from 'react';
import { sendSlackDigest } from '../../lib/slackClient';
import '/src/index.css'; // keep global styles

export default function SettingsPage() {
  const [dailyReminderTime, setDailyReminderTime] = useState('09:00');
  const [enableDailyDigest, setEnableDailyDigest] = useState(true);
  const [enableKudosDigest, setEnableKudosDigest] = useState(true);
  const [notifyNewAssignment, setNotifyNewAssignment] = useState(true);
  const [delivery, setDelivery] = useState('dm'); // 'dm' | 'channel'
  const [channel, setChannel] = useState('#general');

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Daily reminder time</label>
          <input type="time" value={dailyReminderTime} onChange={e => setDailyReminderTime(e.target.value)} />
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={enableDailyDigest} onChange={e => setEnableDailyDigest(e.target.checked)} /> Daily upcoming tasks digest
        </label>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={enableKudosDigest} onChange={e => setEnableKudosDigest(e.target.checked)} /> Daily kudos digest
        </label>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={notifyNewAssignment} onChange={e => setNotifyNewAssignment(e.target.checked)} /> Notify on new assignment
        </label>

        <div>
          <label className="block text-sm">Delivery</label>
          <select value={delivery} onChange={e => setDelivery(e.target.value)}>
            <option value="dm">Direct Message (DM)</option>
            <option value="channel">Channel</option>
          </select>
        </div>

        {delivery === 'channel' && (
          <div>
            <label className="block text-sm">Slack channel</label>
            <input type="text" value={channel} onChange={e => setChannel(e.target.value)} placeholder="#ops-alerts" />
          </div>
        )}

        <div className="flex gap-8 mt-4">
          <button
            className="px-3 py-1 rounded bg-black text-white"
            onClick={async () => {
              // Save stub (later persist to backend)
              alert('Settings saved (stub)');
            }}
          >
            Save
          </button>

          {/* Test sends (Phase 1) */}
          <button
            className="px-3 py-1 rounded bg-slate-800 text-white"
            onClick={async () => {
              await sendSlackDigest({
                type: 'daily-reminder',
                delivery,
                channel,
                when: dailyReminderTime,
                tasks: [],
                kudos: [],
                user: { id: 'me', name: 'Me', email: 'me@fieldworks.com' },
              });
              alert('Sent test daily reminder (stub call)');
            }}
          >
            Send test daily reminder
          </button>

          <button
            className="px-3 py-1 rounded bg-slate-800 text-white"
            onClick={async () => {
              await sendSlackDigest({
                type: 'daily-kudos',
                delivery,
                channel,
                when: dailyReminderTime,
                tasks: [],
                kudos: [{ taskId: '123', title: 'Sample complete', minutes: 42 }],
                user: { id: 'me', name: 'Me', email: 'me@fieldworks.com' },
              });
              alert('Sent test daily kudos (stub call)');
            }}
          >
            Send test kudos
          </button>
        </div>
      </div>
    </div>
  );
}
