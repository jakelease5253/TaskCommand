import { useState, useEffect } from 'react';

const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000';
const MSAL_CONFIG = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '8724797a-a121-4f6c-bc18-2cc72266a686',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID || '327a958f-68a1-40f6-aada-48a87827f0b1'}`,
    redirectUri: REDIRECT_URI
  }
};
const GRAPH_SCOPES = (import.meta.env.VITE_GRAPH_SCOPES || 'Tasks.ReadWrite,Group.Read.All,User.Read').split(',');

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      acquireToken();
    }
  }, []);

  const handleLogin = () => {
    const authUrl = `${MSAL_CONFIG.auth.authority}/oauth2/v2.0/authorize?` +
      `client_id=${MSAL_CONFIG.auth.clientId}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(MSAL_CONFIG.auth.redirectUri)}` +
      `&response_mode=fragment` +
      `&scope=${encodeURIComponent(GRAPH_SCOPES.join(' '))}` +
      `&state=12345` +
      `&nonce=${Date.now()}`;
    window.location.href = authUrl;
  };

  const acquireToken = async () => {
    setLoading(true);
    try {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      
      if (token) {
        setAccessToken(token);
        setIsAuthenticated(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error('No access token found in URL');
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {'Authorization': `Bearer ${accessToken}`}
      });
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setUser(null);
  };

  return {
    isAuthenticated,
    accessToken,
    user,
    setUser,
    loading,
    handleLogin,
    handleLogout,
    fetchUserProfile
  };
}