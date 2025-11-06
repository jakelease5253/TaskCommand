import React, { useState, useEffect, useRef } from "react";
import { Slack, Link, Unlink, Bell, AlertCircle, Check, ChevronDown } from "../../components/ui/icons";
import { useTheme } from "../../contexts/ThemeContext";
import { themes } from "../../constants/themes";

export default function Settings({ accessToken, user }) {
  const [slackConnection, setSlackConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Theme selection from context
  const { currentThemeId, setTheme, theme } = useTheme();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef(null);

  // Default Plan Selection states
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);

  // Backend URL - use environment variable or default
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const fetchAvailablePlans = async () => {
    try {
      setPlansLoading(true);
      const response = await fetch(`${backendUrl}/api/slack/plans`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailablePlans(data.plans || []);

        // Set current selection from preferences
        if (preferences?.defaultPlanId) {
          setSelectedPlan(preferences.defaultPlanId);
          setSelectedBucket(preferences.defaultBucketId);
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load available plans. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleSaveDefaultPlan = async () => {
    try {
      const planData = availablePlans.find(p => p.planId === selectedPlan);
      const bucketData = planData?.buckets.find(b => b.bucketId === selectedBucket);

      await handleUpdatePreferences({
        defaultPlanId: selectedPlan,
        defaultBucketId: selectedBucket,
        defaultPlanName: planData?.planName || null,
        defaultBucketName: bucketData?.bucketName || null
      });

      setSuccess('Default plan saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving default plan:', err);
      setError('Failed to save default plan');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Fetch available plans when Slack is connected
  useEffect(() => {
    if (slackConnection?.connected && preferences) {
      fetchAvailablePlans();
    }
  }, [slackConnection?.connected, preferences?.defaultPlanId]);

  return (
    <div className="max-w-7xl mx-auto" style={{ paddingTop: '24px' }}>
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              fontFamily: 'Poppins',
              color: 'var(--theme-primary-dark)',
              marginBottom: '24px'
            }}>Profile</h2>

            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-6">
              {user?.photo ? (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '100%',
                  backgroundImage: `url(${user.photo})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  marginBottom: '16px'
                }} />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '100%',
                  backgroundColor: 'var(--theme-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '48px',
                    fontWeight: '600',
                    fontFamily: 'Poppins',
                    color: 'var(--theme-primary)'
                  }}>
                    {user?.displayName?.charAt(0) || user?.mail?.charAt(0) || 'U'}
                  </span>
                </div>
              )}

              <button style={{
                padding: '8px 16px',
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: '14px',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}>
                Upload Photo
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: 'Poppins',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>Name</label>
                <p style={{
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)',
                  fontWeight: '500'
                }}>{user?.displayName || 'Not set'}</p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: 'Poppins',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>Email</label>
                <p style={{
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)',
                  fontWeight: '500'
                }}>{user?.mail || user?.userPrincipalName || 'Not set'}</p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: 'Poppins',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>Job Title</label>
                <p style={{
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  color: 'var(--theme-primary-dark)',
                  fontWeight: '500'
                }}>{user?.jobTitle || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Default Plan for Quick Add - Only show when connected */}
          {slackConnection?.connected && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--theme-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="var(--theme-primary)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    fontFamily: 'Poppins',
                    color: 'var(--theme-primary-dark)',
                    margin: 0
                  }}>Default Plan</h2>
                  <p style={{
                    fontSize: '12px',
                    fontFamily: 'Poppins',
                    color: '#64748b',
                    margin: '4px 0 0 0'
                  }}>
                    For <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">/taskcommand add</code>
                  </p>
                </div>
              </div>

              {plansLoading ? (
                <div className="text-center py-8">
                  <div
                    className="inline-block animate-spin rounded-full"
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '4px solid #e5e7eb',
                      borderTopColor: 'var(--theme-primary)'
                    }}
                  />
                  <p style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    color: '#64748b'
                  }}>Loading your plans...</p>
                </div>
              ) : availablePlans.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <p>No Planner plans found with buckets.</p>
                  <p className="text-sm mt-2">Create a plan in Microsoft Planner or Teams first.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Plan Selector */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: 'Poppins',
                      color: 'var(--theme-primary-dark)',
                      marginBottom: '8px'
                    }}>
                      Plan
                    </label>
                    <select
                      value={selectedPlan || ''}
                      onChange={(e) => {
                        setSelectedPlan(e.target.value);
                        setSelectedBucket(null); // Reset bucket when plan changes
                      }}
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
                      <option value="">Select a plan...</option>
                      {availablePlans.map(plan => (
                        <option key={plan.planId} value={plan.planId}>
                          {plan.planName} ({plan.groupName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bucket Selector - Only show when plan is selected */}
                  {selectedPlan && (
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
                        value={selectedBucket || ''}
                        onChange={(e) => setSelectedBucket(e.target.value)}
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
                        <option value="">Select a bucket...</option>
                        {availablePlans
                          .find(p => p.planId === selectedPlan)
                          ?.buckets.map(bucket => (
                            <option key={bucket.bucketId} value={bucket.bucketId}>
                              {bucket.bucketName}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  {/* Save Button */}
                  {selectedPlan && selectedBucket && (
                    <button
                      onClick={handleSaveDefaultPlan}
                      disabled={savingPreferences}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        backgroundColor: savingPreferences ? '#94a3b8' : 'var(--theme-primary)',
                        color: 'var(--theme-primary-dark)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: savingPreferences ? 'not-allowed' : 'pointer',
                        fontFamily: 'Poppins',
                        fontWeight: '500',
                        fontSize: '14px',
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => !savingPreferences && (e.target.style.opacity = '0.9')}
                      onMouseOut={(e) => !savingPreferences && (e.target.style.opacity = '1')}
                    >
                      {savingPreferences ? 'Saving...' : 'Save Default Plan'}
                    </button>
                  )}

                  {/* Current Selection Display */}
                  {preferences?.defaultPlanName && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        fontFamily: 'Poppins',
                        color: '#166534'
                      }}>
                        ✓ Current default: {preferences.defaultPlanName} → {preferences.defaultBucketName}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Selection Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="var(--theme-primary)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                fontFamily: 'Poppins',
                color: 'var(--theme-primary-dark)',
                margin: 0
              }}>Theme</h2>
              <p style={{
                fontSize: '14px',
                fontFamily: 'Poppins',
                color: '#64748b',
                margin: '4px 0 0 0'
              }}>Customize the appearance of your TaskCommand</p>
            </div>
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
          }}>Color Scheme</label>
          <div ref={themeDropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <button
              type="button"
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: theme.colors.primaryDark,
              }}
            >
              <span>{themes[currentThemeId]?.name || 'Select Theme'}</span>
              <ChevronDown style={{
                transition: 'transform 0.2s',
                transform: themeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>

            {themeDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
              >
                {Object.values(themes).map((themeOption) => (
                  <button
                    key={themeOption.id}
                    type="button"
                    onClick={() => {
                      setTheme(themeOption.id);
                      setThemeDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      backgroundColor: currentThemeId === themeOption.id ? theme.colors.primaryLight : '#ffffff',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: theme.colors.primaryDark,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (currentThemeId !== themeOption.id) {
                        e.target.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentThemeId !== themeOption.id) {
                        e.target.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    {themeOption.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p style={{
            fontSize: '12px',
            fontFamily: 'Poppins',
            color: '#64748b',
            marginTop: '8px'
          }}>Select a color scheme for the application</p>
        </div>
      </div>

      {/* Slack Integration Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Slack size={24} style={{ color: 'var(--theme-primary-dark)' }} />
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
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={20} style={{ color: 'var(--theme-primary-dark)' }} />
            </div>
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
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  height: '24px',
                  width: '44px',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  transition: 'background-color 0.2s',
                  backgroundColor: preferences.assignmentNotifications ? 'var(--theme-primary)' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    height: '16px',
                    width: '16px',
                    borderRadius: '9999px',
                    backgroundColor: preferences.assignmentNotifications ? 'var(--theme-primary-dark)' : '#ffffff',
                    transform: preferences.assignmentNotifications ? 'translateX(24px)' : 'translateX(4px)',
                    transition: 'transform 0.2s'
                  }}
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
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    height: '24px',
                    width: '44px',
                    alignItems: 'center',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s',
                    backgroundColor: preferences.morningDigestEnabled ? 'var(--theme-primary)' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      height: '16px',
                      width: '16px',
                      borderRadius: '9999px',
                      backgroundColor: preferences.morningDigestEnabled ? 'var(--theme-primary-dark)' : '#ffffff',
                      transform: preferences.morningDigestEnabled ? 'translateX(24px)' : 'translateX(4px)',
                      transition: 'transform 0.2s'
                    }}
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
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    height: '24px',
                    width: '44px',
                    alignItems: 'center',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s',
                    backgroundColor: preferences.dailyKudosEnabled ? 'var(--theme-primary)' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      height: '16px',
                      width: '16px',
                      borderRadius: '9999px',
                      backgroundColor: preferences.dailyKudosEnabled ? 'var(--theme-primary-dark)' : '#ffffff',
                      transform: preferences.dailyKudosEnabled ? 'translateX(24px)' : 'translateX(4px)',
                      transition: 'transform 0.2s'
                    }}
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
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    height: '24px',
                    width: '44px',
                    alignItems: 'center',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s',
                    backgroundColor: preferences.weeklyDigestEnabled ? 'var(--theme-primary)' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      height: '16px',
                      width: '16px',
                      borderRadius: '9999px',
                      backgroundColor: preferences.weeklyDigestEnabled ? 'var(--theme-primary-dark)' : '#ffffff',
                      transform: preferences.weeklyDigestEnabled ? 'translateX(24px)' : 'translateX(4px)',
                      transition: 'transform 0.2s'
                    }}
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
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  height: '24px',
                  width: '44px',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  transition: 'background-color 0.2s',
                  backgroundColor: preferences.milestonesEnabled ? 'var(--theme-primary)' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    height: '16px',
                    width: '16px',
                    borderRadius: '9999px',
                    backgroundColor: preferences.milestonesEnabled ? 'var(--theme-primary-dark)' : '#ffffff',
                    transform: preferences.milestonesEnabled ? 'translateX(24px)' : 'translateX(4px)',
                    transition: 'transform 0.2s'
                  }}
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
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  height: '24px',
                  width: '44px',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  transition: 'background-color 0.2s',
                  backgroundColor: preferences.handoffNotifications ? 'var(--theme-primary)' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    height: '16px',
                    width: '16px',
                    borderRadius: '9999px',
                    backgroundColor: preferences.handoffNotifications ? 'var(--theme-primary-dark)' : '#ffffff',
                    transform: preferences.handoffNotifications ? 'translateX(24px)' : 'translateX(4px)',
                    transition: 'transform 0.2s'
                  }}
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
        {/* End Right Column */}
      </div>
      {/* End 2-Column Grid */}
    </div>
  );
}
