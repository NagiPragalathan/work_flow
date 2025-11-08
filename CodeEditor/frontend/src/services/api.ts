const API_BASE_URL = "http://localhost:8080";

export interface CreateProjectRequest {
  prompt: string;
}

export interface CreateProjectResponse {
  project_id: string;
  status: string;
  stage: string;
}

export const api = {
  async createProject(prompt: string): Promise<CreateProjectResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create project: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to backend server. Please make sure the backend is running on http://localhost:8080");
      }
      throw error;
    }
  },

  async getProject(projectId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
    
    if (!response.ok) {
      throw new Error("Failed to get project");
    }
    
    return response.json();
  },

  async getProjectFiles(projectId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/files`
    );
    
    if (!response.ok) {
      throw new Error("Failed to get project files");
    }
    
    return response.json();
  },

  async getProjectPreview(projectId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/preview`
    );
    
    if (!response.ok) {
      throw new Error("Failed to get project preview");
    }
    
    return response.json();
  },

  async regenerateProject(projectId: string, prompt: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/regenerate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to regenerate project");
    }
    
    return response.json();
  },

  getWebSocketUrl(projectId: string): string {
    return `ws://localhost:8080/ws/generate/${projectId}`;
  },
};

