const storage = require('./services/storageService');

async function resetCheckTime() {
  try {
    // Set the last check time to 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await storage.setLastTaskCheckTime('9d51b9d0-2c22-4ff7-9dcd-ebfef243b918', oneHourAgo);
    console.log(`Reset last check time to: ${oneHourAgo}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

resetCheckTime();
