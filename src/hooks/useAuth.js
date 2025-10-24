import { useState, useEffect } from 'react';

// Map ports to environments:
// - main (local): http://localhost:3000
// - dev  (local): http://localhost:3001
// - prod: whatever your deployed origin is
const ORIGIN = window.location.origin;
const PORT = window.location.port;
const APP_ENV = PORT === '3001' ? 'dev' : (PORT === '3000' ? 'main' : 'prod');

const REDIRECT_URI = ORIGIN;

// Allow env-specific client/tenant overrides with sensible fallbacks
const MSAL_CLIENT_ID =
  (APP_ENV === 'dev'  ? import.meta.env.VITE_MSAL_CLIENT_ID_DEV  :
   APP_ENV === 'main' ? import.meta.env.VITE_MSAL_CLIENT_ID_MAIN :
                        import.meta.env.VITE_MSAL_CLIENT_ID) ||
  import.meta.env.VITE_MSAL_CLIENT_ID;

const MSAL_TENANT_ID =
  (APP_ENV === 'dev'  ? import.meta.env.VITE_MSAL_TENANT_ID_DEV  :
   APP_ENV === 'main' ? import.meta.env.VITE_MSAL_TENANT_ID_MAIN :
                        import.meta.env.VITE_MSAL_TENANT_ID) ||
  import.meta.env.VITE_MSAL_TENANT_ID;

const GRAPH_SCOPES =
  (APP_ENV === 'dev'
    ? (import.meta.env.VITE_GRAPH_SCOPES_DEV || import.meta.env.VITE_GRAPH_SCOPES)
    : APP_ENV === 'main'
    ? (import.meta.env.VITE_GRAPH_SCOPES_MAIN || import.meta.env.VITE_GRAPH_SCOPES)
    : import.meta.env.VITE_GRAPH_SCOPES || 'Tasks.ReadWrite,Group.Read.All,User.Read'
  ).split(',');

const MSAL_CONFIG = {
  auth: {
    clientId: MSAL_CLIENT_ID || '8724797a-a121-4f6c-bc18-2cc72266a686',
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID || '327a958f-68a1-40f6-aada-48a87827f0b1'}`,
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: REDIRECT_URI
  }
};

// Tiny floating banner to show current environment. Hidden in prod.
function ensureEnvBadge() {
  try {
    if (APP_ENV === 'prod') return;
    const ID = 'env-badge';
    if (document.getElementById(ID)) return;
    const el = document.createElement('div');
    el.id = ID;
    el.textContent = APP_ENV.toUpperCase();
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '8px',
      left: '8px',
      padding: '6px 10px',
      fontSize: '12px',
      fontWeight: '600',
      background: APP_ENV === 'dev' ? '#ffe08a' : '#b3e6ff', // dev = yellow, main = blue
      color: '#000',
      border: '1px solid rgba(0,0,0,0.2)',
      borderRadius: '6px',
      zIndex: '2147483647',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      letterSpacing: '0.5px',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    });
    document.body.appendChild(el);
  } catch (_) {
    // no-op
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureEnvBadge();
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