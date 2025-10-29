import React, { useState, useEffect } from "react";
import { Slack, Link, Unlink, Bell, AlertCircle, Check } from "../../components/ui/icons";

export default function Settings({ accessToken, user }) {
  const [slackConnection, setSlackConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Backend URL - use environment variable or default
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';

  // Check Slack connection status on mount
  useEffect(() => {
    checkSlackConnection();

    // Check for OAuth callback results in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('slack_connected') === 'true') {
      setSuccess('Successfully connected to Slack!');
      setTimeout(() => setSuccess(null), 5000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname + '?view=settings');
    } else if (params.get('slack_error')) {
      const errorType = params.get('slack_error');
      const errorDetail = params.get('error_detail');
      let errorMsg = 'Failed to connect to Slack. Please try again.';
      if (errorType === 'access_denied') {
        errorMsg = 'You denied access to Slack.';
      } else if (errorDetail) {
        errorMsg = `Connection failed: ${errorDetail}`;
      }
      setError(errorMsg);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname + '?view=settings');
    }
  }, [accessToken]);

  const checkSlackConnection = async () => {
    if (!accessToken || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/slack/connection/status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSlackConnection(data);
        if (data.connected && data.preferences) {
          setPreferences(data.preferences);
        }
      } else if (response.status === 404) {
        // Not connected
        setSlackConnection({ connected: false });
      } else {
        throw new Error('Failed to check Slack connection');
      }
    } catch (err) {
      console.error('Error checking Slack connection:', err);
      setError('Unable to check Slack connection status');
      setSlackConnection({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSlack = () => {
    // Clear any previous messages
    setError(null);
    setSuccess(null);

    // Build OAuth URL
    const clientId = '20478714756.9785587179955';
    const redirectUri = `${backendUrl}/api/slack/oauth/callback`;
    const scopes = [
      'chat:write',
      'commands',
      'users:read',
      'im:write',
      'im:history',
      'reactions:read',
      'channels:history'
    ].join(',');

    // Generate state for CSRF protection
    const state = btoa(JSON.stringify({
      userId: user?.id || user?.mail || 'unknown',
      timestamp: Date.now(),
      returnUrl: window.location.href
    }));

    const oauthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    console.log('=== Slack OAuth Debug ===');
    console.log('Backend URL:', backendUrl);
    console.log('Redirect URI:', redirectUri);
    console.log('Client ID:', clientId);
    console.log('Full OAuth URL:', oauthUrl);
    console.log('========================');

    // Redirect to Slack OAuth
    window.location.href = oauthUrl;
  };

  const handleDisconnectSlack = async () => {
    if (!confirm('Are you sure you want to disconnect Slack? You will stop receiving notifications.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/slack/connection`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Slack');
      }

      setSuccess('Successfully disconnected from Slack');
      setSlackConnection({ connected: false });
      setPreferences(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error disconnecting Slack:', err);
      setError('Failed to disconnect Slack. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (updatedPrefs) => {
    try {
      setSavingPreferences(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/slack/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(updatedPrefs)
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data);
      setSuccess('Preferences saved successfully');

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSavingPreferences(false);
    }
  };

  const togglePreference = (key) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    handleUpdatePreferences(updated);
  };

  const updatePreferenceValue = (key, value) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    handleUpdatePreferences(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Slack Integration Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Slack size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Slack Integration</h2>
              <p className="text-sm text-slate-600">Manage tasks directly from Slack</p>
            </div>
          </div>
          {loading && (
            <div className="text-sm text-slate-500">Checking connection...</div>
          )}
        </div>

        {/* Connection Status */}
        {!loading && slackConnection && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {slackConnection.connected ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="font-medium text-slate-800">Connected to Slack</p>
                      {slackConnection.slackUserId && (
                        <p className="text-sm text-slate-600">User ID: {slackConnection.slackUserId}</p>
                      )}
                      {slackConnection.connectedAt && (
                        <p className="text-xs text-slate-500">
                          Connected {new Date(slackConnection.connectedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <div>
                      <p className="font-medium text-slate-800">Not Connected</p>
                      <p className="text-sm text-slate-600">Connect your Slack account to enable notifications</p>
                    </div>
                  </>
                )}
              </div>

              {slackConnection.connected ? (
                <button
                  onClick={handleDisconnectSlack}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                >
                  <Unlink size={16} />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnectSlack}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  <Link size={16} />
                  Connect to Slack
                </button>
              )}
            </div>
          </div>
        )}

        {/* Features List */}
        {!slackConnection?.connected && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700 mb-3">With Slack integration, you can:</p>
            <ul className="space-y-2">
              {[
                'Use slash commands to view and manage tasks',
                'Get notified when tasks are assigned to you',
                'Receive daily digest of tasks due today',
                'Get daily kudos for tasks completed',
                'Complete tasks with interactive buttons',
                'Create tasks from Slack messages'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Notification Preferences - Only show when connected */}
      {slackConnection?.connected && preferences && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-slate-600" />
            <h3 className="text-xl font-bold text-slate-800">Notification Preferences</h3>
          </div>

          <div className="space-y-6">
            {/* Assignment Notifications */}
            <div className="flex items-start justify-between py-4 border-b border-slate-200">
              <div>
                <h4 className="font-medium text-slate-800">Assignment Notifications</h4>
                <p className="text-sm text-slate-600 mt-1">Get notified when a task is assigned to you</p>
              </div>
              <button
                onClick={() => togglePreference('assignmentNotifications')}
                disabled={savingPreferences}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.assignmentNotifications ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.assignmentNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Morning Digest */}
            <div className="py-4 border-b border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-slate-800">Morning Digest</h4>
                  <p className="text-sm text-slate-600 mt-1">Daily summary of tasks due today and overdue tasks</p>
                </div>
                <button
                  onClick={() => togglePreference('morningDigestEnabled')}
                  disabled={savingPreferences}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.morningDigestEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.morningDigestEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {preferences.morningDigestEnabled && (
                <div className="ml-4">
                  <label className="text-sm text-slate-700">
                    Time:{' '}
                    <input
                      type="time"
                      value={preferences.morningDigestTime || '08:00'}
                      onChange={(e) => updatePreferenceValue('morningDigestTime', e.target.value)}
                      disabled={savingPreferences}
                      className="ml-2 px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Daily Kudos */}
            <div className="py-4 border-b border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-slate-800">Daily Kudos</h4>
                  <p className="text-sm text-slate-600 mt-1">End-of-day summary of tasks you completed</p>
                </div>
                <button
                  onClick={() => togglePreference('dailyKudosEnabled')}
                  disabled={savingPreferences}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.dailyKudosEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.dailyKudosEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {preferences.dailyKudosEnabled && (
                <div className="ml-4">
                  <label className="text-sm text-slate-700">
                    Time:{' '}
                    <input
                      type="time"
                      value={preferences.dailyKudosTime || '17:00'}
                      onChange={(e) => updatePreferenceValue('dailyKudosTime', e.target.value)}
                      disabled={savingPreferences}
                      className="ml-2 px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Weekly Summary */}
            <div className="py-4 border-b border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-slate-800">Weekly Summary</h4>
                  <p className="text-sm text-slate-600 mt-1">Weekly productivity trends and insights</p>
                </div>
                <button
                  onClick={() => togglePreference('weeklyDigestEnabled')}
                  disabled={savingPreferences}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.weeklyDigestEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.weeklyDigestEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {preferences.weeklyDigestEnabled && (
                <div className="ml-4 flex gap-4">
                  <label className="text-sm text-slate-700">
                    Day:{' '}
                    <select
                      value={preferences.weeklyDigestDay || 'Friday'}
                      onChange={(e) => updatePreferenceValue('weeklyDigestDay', e.target.value)}
                      disabled={savingPreferences}
                      className="ml-2 px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                      <option>Saturday</option>
                      <option>Sunday</option>
                    </select>
                  </label>
                  <label className="text-sm text-slate-700">
                    Time:{' '}
                    <input
                      type="time"
                      value={preferences.weeklyDigestTime || '16:00'}
                      onChange={(e) => updatePreferenceValue('weeklyDigestTime', e.target.value)}
                      disabled={savingPreferences}
                      className="ml-2 px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Milestone Celebrations */}
            <div className="flex items-start justify-between py-4 border-b border-slate-200">
              <div>
                <h4 className="font-medium text-slate-800">Milestone Celebrations</h4>
                <p className="text-sm text-slate-600 mt-1">Get celebrated for achievements (e.g., 100 tasks, 5-day streak)</p>
              </div>
              <button
                onClick={() => togglePreference('milestonesEnabled')}
                disabled={savingPreferences}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.milestonesEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.milestonesEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Handoff Notifications */}
            <div className="flex items-start justify-between py-4 border-b border-slate-200">
              <div>
                <h4 className="font-medium text-slate-800">Task Reassignment Notifications</h4>
                <p className="text-sm text-slate-600 mt-1">Get notified when a task is reassigned to you</p>
              </div>
              <button
                onClick={() => togglePreference('handoffNotifications')}
                disabled={savingPreferences}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.handoffNotifications ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.handoffNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Quiet Hours */}
            <div className="py-4">
              <h4 className="font-medium text-slate-800 mb-2">Quiet Hours</h4>
              <p className="text-sm text-slate-600 mb-3">No notifications during these hours</p>
              <div className="flex gap-4 ml-4">
                <label className="text-sm text-slate-700">
                  Start:{' '}
                  <input
                    type="time"
                    value={preferences.quietHoursStart || ''}
                    onChange={(e) => updatePreferenceValue('quietHoursStart', e.target.value || null)}
                    disabled={savingPreferences}
                    placeholder="Not set"
                    className="ml-2 px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  End:{' '}
                  <input
                    type="time"
                    value={preferences.quietHoursEnd || ''}
                    onChange={(e) => updatePreferenceValue('quietHoursEnd', e.target.value || null)}
                    disabled={savingPreferences}
                    placeholder="Not set"
                    className="ml-2 px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>
              {!preferences.quietHoursStart && !preferences.quietHoursEnd && (
                <p className="text-xs text-slate-500 mt-2 ml-4">Set times to enable quiet hours</p>
              )}
            </div>
          </div>

          {savingPreferences && (
            <div className="mt-4 text-sm text-slate-600 text-center">
              Saving preferences...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
