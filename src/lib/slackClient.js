// src/lib/slackClient.js
export async function sendSlackDigest({ type, delivery, channel, when, tasks, kudos, user }) {
  const url = import.meta.env.VITE_SLACK_FLOW_URL; // set in .env.development
  if (!url) throw new Error('Missing VITE_SLACK_FLOW_URL');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ type, delivery, channel, when, tasks, kudos, user }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Slack flow error: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return {}; }
}
