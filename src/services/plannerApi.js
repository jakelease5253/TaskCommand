// Shared Microsoft Graph / Planner request helpers.
//
// Every Graph call in the app should go through graphRequest so that
// non-2xx responses become thrown GraphApiError objects instead of being
// silently treated as successes (fetch only rejects on network failures).

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

export class GraphApiError extends Error {
  constructor(status, body, path) {
    const graphMessage = body?.error?.message;
    super(graphMessage || `Graph request failed with ${status}`);
    this.name = 'GraphApiError';
    this.status = status;
    this.code = body?.error?.code;
    this.path = path;
  }
}

/**
 * Fetch against Microsoft Graph. Throws GraphApiError on any non-2xx
 * response. Returns the parsed JSON body (or null for 204 No Content).
 */
export async function graphRequest(accessToken, path, options = {}) {
  const response = await fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new GraphApiError(response.status, body, path);
  }

  return body;
}

/**
 * Patch a Planner task: fetches a fresh etag, sends If-Match, and retries
 * once on a 412 (etag conflict - someone else updated the task between our
 * fetch and patch). Returns the updated task representation.
 */
export async function patchPlannerTask(accessToken, taskId, changes) {
  return patchWithEtag(accessToken, `/planner/tasks/${taskId}`, changes);
}

/**
 * Patch a Planner task's details resource (description, checklist, ...).
 */
export async function patchPlannerTaskDetails(accessToken, taskId, changes) {
  return patchWithEtag(accessToken, `/planner/tasks/${taskId}/details`, changes);
}

async function patchWithEtag(accessToken, path, changes, attempt = 0) {
  const current = await graphRequest(accessToken, path);
  try {
    return await graphRequest(accessToken, path, {
      method: 'PATCH',
      headers: {
        'If-Match': current['@odata.etag'],
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(changes),
    });
  } catch (err) {
    if (err instanceof GraphApiError && err.status === 412 && attempt < 1) {
      return patchWithEtag(accessToken, path, changes, attempt + 1);
    }
    throw err;
  }
}

/**
 * Run one async task-operation per id concurrently and split the results.
 * Returns { successfulIds, failedIds, errors } - callers use this to report
 * partial failures honestly instead of assuming everything worked.
 */
export async function forEachTask(taskIds, operation) {
  const results = await Promise.allSettled(taskIds.map((id) => operation(id)));
  const successfulIds = [];
  const failedIds = [];
  const errors = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      successfulIds.push(taskIds[i]);
    } else {
      failedIds.push(taskIds[i]);
      errors.push(result.reason);
    }
  });
  return { successfulIds, failedIds, errors };
}
