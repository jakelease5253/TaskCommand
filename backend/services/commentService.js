const { getGraphClient, getPlan } = require('./graphClient');
const { Client } = require('@microsoft/microsoft-graph-client');

/**
 * Get all comments for a task
 * @param {string} taskId - Planner task ID
 * @param {string} planId - Planner plan ID (needed to get group ID)
 * @returns {Promise<Array>} Array of comments
 */
async function getTaskComments(taskId, planId) {
  try {
    const client = getGraphClient();

    // Get the task to check if it has a conversation thread
    const task = await client
      .api(`/planner/tasks/${taskId}`)
      .select('id,title,conversationThreadId')
      .get();

    // If no conversation thread, return empty array
    if (!task.conversationThreadId) {
      return [];
    }

    // Get the plan to find the group ID
    const plan = await getPlan(planId);
    const groupId = plan.owner;

    // Get all posts in the conversation thread
    const posts = await client
      .api(`/groups/${groupId}/threads/${task.conversationThreadId}/posts`)
      .get();

    // Transform posts into a simpler format
    return posts.value.map(post => ({
      id: post.id,
      author: post.from?.emailAddress?.name || 'Unknown',
      authorEmail: post.from?.emailAddress?.address || '',
      content: stripHtml(post.body?.content || ''),
      htmlContent: post.body?.content || '',
      createdAt: post.receivedDateTime,
      hasAttachments: post.hasAttachments || false
    }));

  } catch (error) {
    console.error('Error fetching task comments:', error);
    throw error;
  }
}

/**
 * Add a comment to a task
 * @param {string} taskId - Planner task ID
 * @param {string} planId - Planner plan ID (needed to get group ID)
 * @param {string} comment - Comment text
 * @param {string} userToken - Optional user access token (for delegated permissions)
 * @returns {Promise<object>} Created comment
 */
async function addTaskComment(taskId, planId, comment, userToken = null) {
  try {
    // Use user token if provided (delegated permissions), otherwise use app token
    const client = userToken
      ? Client.initWithMiddleware({
          authProvider: {
            getAccessToken: async () => userToken
          }
        })
      : getGraphClient();

    // Get the task
    const task = await client
      .api(`/planner/tasks/${taskId}`)
      .select('id,title,conversationThreadId')
      .get();

    // Get the plan to find the group ID
    const plan = await getPlan(planId);
    const groupId = plan.owner;

    let conversationThreadId = task.conversationThreadId;

    // If task doesn't have a conversation thread, create one
    if (!conversationThreadId) {
      console.log('Task does not have a conversation thread. Creating one...');

      // Create a new conversation thread in the group
      const newConversation = {
        topic: `Comments for task: ${task.title}`,
        threads: [{
          posts: [{
            body: {
              contentType: 'text',
              content: comment
            }
          }]
        }]
      };

      const conversation = await client
        .api(`/groups/${groupId}/conversations`)
        .post(newConversation);

      conversationThreadId = conversation.threads[0].id;

      console.log('Created conversation thread:', conversationThreadId);

      return {
        id: conversation.threads[0].posts[0].id,
        content: comment,
        createdAt: new Date().toISOString()
      };
    }

    // If thread exists, reply to it
    const newPost = {
      post: {
        body: {
          contentType: 'text',
          content: comment
        }
      }
    };

    const response = await client
      .api(`/groups/${groupId}/threads/${conversationThreadId}/reply`)
      .post(newPost);

    return {
      id: response.id,
      content: comment,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error adding task comment:', error);
    throw error;
  }
}

/**
 * Strip HTML tags from content for plain text display
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
function stripHtml(html) {
  if (!html) return '';

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

module.exports = {
  getTaskComments,
  addTaskComment
};
