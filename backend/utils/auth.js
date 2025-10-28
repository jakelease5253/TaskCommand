const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

/**
 * Validate user's access token by calling Microsoft Graph /me endpoint
 * Returns user info if valid, throws error if invalid
 */
async function validateUserToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      }
    });

    // Call /me to validate token and get user info
    const user = await client
      .api('/me')
      .select('id,displayName,userPrincipalName,mail')
      .get();

    return user;

  } catch (err) {
    console.error('Token validation failed:', err.message);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Check if user is authorized to access manager dashboard
 * Currently checks if user is in "Managers" group or has specific role
 *
 * TODO: Customize this based on your organization's requirements
 * Options:
 * - Check group membership (recommended)
 * - Check Azure AD role
 * - Check specific user IDs
 * - Custom logic
 */
async function checkManagerAuthorization(user, userToken) {
  // For now, allow all authenticated users
  // TODO: Implement actual role check

  // Example: Check if user is in "Managers" security group
  // Uncomment and modify when you're ready to add restrictions

  /*
  const client = Client.init({
    authProvider: (done) => done(null, userToken)
  });

  const memberOf = await client
    .api(`/me/memberOf`)
    .get();

  const isManager = memberOf.value.some(
    group => group.displayName === 'Managers' ||
             group.id === 'YOUR_MANAGERS_GROUP_ID'
  );

  if (!isManager) {
    throw new Error('User does not have manager permissions');
  }
  */

  console.log(`User ${user.displayName} authorized for manager dashboard`);
  return true;
}

module.exports = {
  validateUserToken,
  checkManagerAuthorization
};
