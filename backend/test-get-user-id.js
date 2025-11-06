const { TableClient } = require('@azure/data-tables');

// Use development storage
const connectionString = 'UseDevelopmentStorage=true';
const slackMappingsClient = TableClient.fromConnectionString(connectionString, 'SlackUserMappings');

async function getUserIds() {
  try {
    const entities = [];
    const iterator = slackMappingsClient.listEntities({
      queryOptions: { filter: `PartitionKey eq 'slackMapping'` }
    });

    for await (const entity of iterator) {
      entities.push({
        azureUserId: entity.rowKey,
        slackUserId: entity.slackUserId,
        connectedAt: entity.connectedAt
      });
    }

    console.log('Azure User IDs in storage:');
    console.log(JSON.stringify(entities, null, 2));

    if (entities.length > 0) {
      console.log('\nUse this Azure User ID for testing:', entities[0].azureUserId);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getUserIds();
