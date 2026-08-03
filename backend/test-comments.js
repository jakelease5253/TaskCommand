/**
 * Test script to verify we can access Planner task comments via Graph API
 *
 * Run with: node test-comments.js
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
require('isomorphic-fetch');

// Load environment variables from local.settings.json
const localSettings = require('./local.settings.json');
process.env.AZURE_TENANT_ID = localSettings.Values.AZURE_TENANT_ID;
process.env.AZURE_CLIENT_ID = localSettings.Values.AZURE_CLIENT_ID;
process.env.AZURE_CLIENT_SECRET = localSettings.Values.AZURE_CLIENT_SECRET;

function getGraphClient() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      }
    }
  });
}

async function testTaskComments() {
  console.log('🔍 Testing Planner Task Comments Access\n');

  try {
    // Create Graph client
    console.log('1️⃣ Creating Graph client...');
    const client = getGraphClient();
    console.log('   ✅ Client created\n');

    // Step 1: Get all groups and find a task with comments
    console.log('2️⃣ Fetching groups...');
    const groupsResponse = await client
      .api('/groups')
      .select('id,displayName')
      .filter("groupTypes/any(c:c eq 'Unified')") // Only Microsoft 365 groups
      .top(50)  // Increased to get more groups
      .get();

    console.log(`   Found ${groupsResponse.value.length} groups\n`);

    let task = null;
    let groupId = null;
    let totalTasks = 0;
    let tasksWithThreads = 0;

    // Search through groups to find a task with a conversation thread
    for (const group of groupsResponse.value) {
      try {
        console.log(`   Checking group: ${group.displayName}...`);
        const plansResponse = await client
          .api(`/groups/${group.id}/planner/plans`)
          .get();

        console.log(`      Found ${plansResponse.value.length} plan(s)`);

        for (const plan of plansResponse.value) {
          console.log(`      📋 Plan: ${plan.title}`);

          const tasksResponse = await client
            .api(`/planner/plans/${plan.id}/tasks`)
            .select('id,title,conversationThreadId,planId')
            .top(100)  // Increased to get more tasks
            .get();

          totalTasks += tasksResponse.value.length;
          console.log(`         Found ${tasksResponse.value.length} task(s)`);

          // Show all task titles
          tasksResponse.value.forEach(t => {
            console.log(`         - ${t.title}${t.conversationThreadId ? ' (has comments)' : ''}`);
          });

          // Count tasks with conversation threads
          tasksResponse.value.forEach(t => {
            if (t.conversationThreadId) {
              tasksWithThreads++;
              console.log(`      ✓ Task "${t.title}" has thread: ${t.conversationThreadId}`);
            }
          });

          // Find a task with a conversation thread
          const taskWithComments = tasksResponse.value.find(t => t.conversationThreadId);

          if (taskWithComments) {
            task = taskWithComments;
            groupId = group.id;
            console.log(`   ✅ Found task with comments!\n`);
            break;
          }
        }

        if (task) break;
      } catch (err) {
        console.log(`   ⚠️  Error checking group: ${err.message}`);
        continue;
      }
    }

    console.log(`\n   📊 Summary: Checked ${totalTasks} tasks, ${tasksWithThreads} have conversation threads\n`);

    // Also search for "Comment Test Task" specifically
    let testTask = null;
    let testGroupId = null;

    console.log('\n   🔍 Searching for "Comment Test Task"...');
    for (const group of groupsResponse.value) {
      try {
        const plansResponse = await client
          .api(`/groups/${group.id}/planner/plans`)
          .get();

        for (const plan of plansResponse.value) {
          const tasksResponse = await client
            .api(`/planner/plans/${plan.id}/tasks`)
            .select('id,title,conversationThreadId,planId')
            .top(100)
            .get();

          const foundTask = tasksResponse.value.find(t => t.title === 'Comment Test Task');
          if (foundTask) {
            testTask = foundTask;
            testGroupId = group.id;
            console.log(`   ✅ Found "Comment Test Task" in group: ${group.displayName}\n`);
            break;
          }
        }
        if (testTask) break;
      } catch (err) {
        continue;
      }
    }

    // Use test task if found, otherwise use first task with comments
    if (testTask) {
      task = testTask;
      groupId = testGroupId;
      console.log('   📝 Using "Comment Test Task" for testing\n');
    } else if (!task) {
      console.log('   ⚠️  No tasks with conversation threads found');
      console.log('   💡 Create a comment on a task in Planner first, then re-run this test\n');
      return;
    }

    console.log(`3️⃣ Task details:`);
    console.log(`   Task: ${task.title}`);
    console.log(`   Task ID: ${task.id}`);
    console.log(`   Plan ID: ${task.planId}`);
    console.log(`   Group ID: ${groupId}`);
    console.log(`   Conversation Thread ID: ${task.conversationThreadId || 'NONE'}\n`);

    if (!task.conversationThreadId) {
      console.log('   ⚠️  This task has no conversation thread yet');
      console.log('   💡 Need to add first comment in Planner, then re-run\n');
      return;
    }

    // Step 3: Try to read comments from the conversation thread
    console.log('4️⃣ Fetching conversation thread posts...');
    try {
      const posts = await client
        .api(`/groups/${groupId}/threads/${task.conversationThreadId}/posts`)
        .get();

      console.log(`   ✅ Successfully retrieved ${posts.value.length} post(s)!\n`);

      if (posts.value.length > 0) {
        console.log('   📝 Sample post:');
        const post = posts.value[0];
        console.log(`      From: ${post.from.emailAddress.name}`);
        console.log(`      Date: ${post.receivedDateTime}`);
        console.log(`      Content: ${post.body.content.substring(0, 100)}...`);
      }

      console.log('\n✅ SUCCESS! Comments are readable via Graph API\n');

      // Step 4: Try to POST a new comment
      console.log('5️⃣ Testing POST - Adding a new comment...');
      try {
        const timestamp = new Date().toISOString();
        const newComment = {
          post: {
            body: {
              contentType: 'text',
              content: `Test comment from Graph API - ${timestamp}`
            }
          }
        };

        const postResponse = await client
          .api(`/groups/${groupId}/threads/${task.conversationThreadId}/reply`)
          .post(newComment);

        console.log('   ✅ Successfully posted new comment!');
        console.log(`   📝 Comment ID: ${postResponse.id}`);
        console.log(`   📝 Content: ${newComment.post.body.content}\n`);

        // Read comments again to verify
        console.log('6️⃣ Verifying comment was added...');
        const updatedPosts = await client
          .api(`/groups/${groupId}/threads/${task.conversationThreadId}/posts`)
          .get();

        console.log(`   ✅ Thread now has ${updatedPosts.value.length} post(s)\n`);

        console.log('\n✅ FULL SUCCESS! Comments are fully read/write accessible via Graph API');
        console.log('\n📊 Summary:');
        console.log('   • Can read task conversation threads: YES ✅');
        console.log('   • Can write to task conversation threads: YES ✅');
        console.log('   • Read endpoint: GET /groups/{groupId}/threads/{threadId}/posts');
        console.log('   • Write endpoint: POST /groups/{groupId}/threads/{threadId}/reply');
        console.log('   • Required permission: Group.Read.All (read), Group.ReadWrite.All (write)');
        console.log('   • Backend currently has: Group.Read.All');
        console.log('   • Next step: Add Group.ReadWrite.All permission for write access');

      } catch (postError) {
        console.log(`\n   ❌ Error posting comment: ${postError.message}`);
        console.log(`   Status Code: ${postError.statusCode}`);
        if (postError.body) {
          console.log('   Full Error:', JSON.stringify(postError.body, null, 2));
        }

        if (postError.statusCode === 403) {
          console.log('\n   ⚠️  Permission denied for writing comments');
          console.log('   💡 This could be due to:');
          console.log('      1. Token caching (Azure AD tokens can cache for up to 1 hour)');
          console.log('      2. Permission not yet propagated');
          console.log('      3. Different permission needed for Planner conversation threads\n');

          console.log('\n✅ PARTIAL SUCCESS! Comments are readable via Graph API');
          console.log('\n📊 Summary:');
          console.log('   • Can read task conversation threads: YES ✅');
          console.log('   • Can write to task conversation threads: NO (need permission)');
          console.log('   • Read endpoint: GET /groups/{groupId}/threads/{threadId}/posts');
          console.log('   • Write endpoint: POST /groups/{groupId}/threads/{threadId}/reply');
          console.log('   • Required permissions: Group.Read.All (read), Group.ReadWrite.All (write)');
          console.log('   • Backend currently has: Group.Read.All only');
          console.log('   • Next step: Add Group.ReadWrite.All permission');
        } else {
          console.log(`   ❌ Error posting comment: ${postError.message}`);
          if (postError.statusCode) {
            console.log(`   Status: ${postError.statusCode}`);
          }
          if (postError.body) {
            console.log('   Details:', JSON.stringify(postError.body, null, 2));
          }
        }
      }

    } catch (error) {
      if (error.statusCode === 403) {
        console.log('   ❌ Permission denied!');
        console.log('   💡 Need to add Group.Read.All permission to backend app');
        console.log('   💡 Then grant admin consent in Azure Portal');
      } else if (error.statusCode === 404) {
        console.log('   ⚠️  Thread not found - may have been deleted');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.statusCode) {
      console.error(`   Status: ${error.statusCode}`);
    }
    if (error.body) {
      console.error('   Details:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Run test
testTaskComments().catch(console.error);
