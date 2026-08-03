const storage = require('./services/storageService');

async function initializeTables() {
  console.log('Initializing Azure Tables...');
  await storage.initializeTables();
  console.log('Tables initialized successfully!');
  process.exit(0);
}

initializeTables().catch(error => {
  console.error('Error initializing tables:', error);
  process.exit(1);
});
