// Root entry point for all Azure Functions
// This file registers all HTTP triggers using @azure/functions v4

require('./GetCompanyTasks/index');
require('./CompleteTask/index');
