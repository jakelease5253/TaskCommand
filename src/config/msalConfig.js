export const MSAL_CONFIG = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '8724797a-a121-4f6c-bc18-2cc72266a686',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID || '327a958f-68a1-40f6-aada-48a87827f0b1'}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000'
  }
};

export const GRAPH_SCOPES = (import.meta.env.VITE_GRAPH_SCOPES || 'Tasks.ReadWrite,Group.Read.All,User.Read').split(',');