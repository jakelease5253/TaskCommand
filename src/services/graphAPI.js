export class GraphApiService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getUserProfile() {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: this.headers
    });
    return response.json();
  }

  async getPlans() {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/planner/plans', {
      headers: this.headers
    });
    return response.json();
  }

  async getTasks() {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/planner/tasks', {
      headers: this.headers
    });
    return response.json();
  }

  async completeTask(taskId, etag) {
    const response = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        ...this.headers,
        'If-Match': etag
      },
      body: JSON.stringify({ percentComplete: 100 })
    });
    return response.json();
  }

  // Add more methods as needed from your index.html
}