import { auth } from "./auth";

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://ai-notes-backend-h185.onrender.com/api'
    : 'http://localhost:5000/api';


// Safely builds query strings
function buildQueryParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const result = searchParams.toString();
  return result ? `?${result}` : '';
}

//Authenticated requests
const authFetch = (url: string, options: RequestInit = {}, token: string) => {
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  });
};

async function handleResponse(res: Response) {
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const api = {

  login: (email: string, password: string) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  signup: (name: string, email: string, password: string) =>
    fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  googleLogin: (credential: string) =>
    fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    }).then(handleResponse),

  forgotPassword: (email: string) =>
    fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(handleResponse),


  resetPassword: (token: string | null, newPassword: string) =>
    fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    }).then(handleResponse),

  getCurrentUser: (token: string) =>
    authFetch('/auth/me', {}, token),

  getNotes: (token: string, params?: {
    search?: string;
    page?: number;
    limit?: number;
    filter?: 'all' | 'own' | 'shared';
  }) =>
    authFetch(`/notes${buildQueryParams(params || {})}`, {}, token),

  getNote: (token: string, id: string) =>
    authFetch(`/notes/${id}`, {}, token),

  createNote: (token: string, note: { title: string; content: string; contentType?: string }) =>
    authFetch('/notes', { method: 'POST', body: JSON.stringify(note) }, token),

  updateNote: (token: string, id: string, note: { title?: string; content?: string }) =>
    authFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(note) }, token),

  deleteNote: (token: string, id: string) =>
    authFetch(`/notes/${id}`, { method: 'DELETE' }, token),


  getCollaborationHistory: (token: string) =>
    authFetch('/notes/collaboration/history', {}, token),

  getCombinedCollaborationHistory: (token: string) =>
    authFetch('/tasks/collaboration/history', {}, token),

  //  SHARING ENDPOINTS
  getNotesSharedByMe: (token: string) =>
    authFetch('/notes/shared-by-me', {}, token),

  shareNote: (token: string, noteId: string, data: { sharedWithEmail: string; permission: string }) =>
    authFetch(`/notes/${noteId}/share`, { method: 'POST', body: JSON.stringify(data) }, token),

  getSharedNotes: (token: string) =>
    authFetch('/notes/shared', {}, token),


  revokeShare: (token: string, noteId: string, userId: string) =>
    authFetch(`/notes/${noteId}/share/${userId}`, { method: 'DELETE' }, token),


  //Tasks sharing endpoints
  shareTask: (token: string, taskId: string, data: { sharedWithEmail: string, permission: string }) =>
    authFetch(`/tasks/${taskId}/share`, { method: 'POST', body: JSON.stringify(data) }, token),

  getSharedTasks: (token: string) =>
    authFetch(`/tasks/shared`, {}, token),
  getTasksSharedByMe: (token: string) =>
    authFetch('/tasks/shared-by-me', {}, token),

  revokeTaskShare: (token: string, taskId: string, userId: string) =>
    authFetch(`/tasks/${taskId}/share/${userId}`, { method: 'DELETE' }, token),

  bulkRevokeTaskShares: (token: string, data: { shareIds: string[] }) =>
    authFetch('/tasks/bulk-revoke-shares', { method: 'POST', body: JSON.stringify(data) }, token),
  bulkRevokeShares: (token: string, data: { shareIds: string[] }) =>
    authFetch('/notes/bulk-revoke-shares', {
      method: 'POST',
      body: JSON.stringify(data)
    }, token),

  summarizeNote: (token: string, data: { content: string; noteId?: string }) =>
    authFetch('/ai/summarize-manual', { method: 'POST', body: JSON.stringify(data) }, token),

  extractActions: (token: string, data: { content: string; noteId?: string }) =>
    authFetch('/ai/extract-actions', { method: 'POST', body: JSON.stringify(data) }, token),

  enhanceContent: (token: string, data: { content: string; noteId?: string }) =>
    authFetch('/ai/enhance', { method: 'POST', body: JSON.stringify(data) }, token),

  checkAIHealth: (token: string) =>
    authFetch('/ai/health', {}, token),

  // TASKS ENDPOINTS
  getTasks: (token: string, filters?: { status?: string; search?: string; page?: number; limit?: number; projectId?: string }) =>
    authFetch(`/tasks${buildQueryParams(filters || {})}`, {}, token),

  getTask: (token: string, id: string) =>
    authFetch(`/tasks/${id}`, {}, token),

  createTask: (token: string, task: { title: string; description?: string; status?: string; deadline?: string; projectId?: string | null; urgency?: string; }) =>
    authFetch('/tasks', { method: 'POST', body: JSON.stringify(task) }, token),

  updateTask: (token: string, id: string, task: { title?: string; description?: string; status?: string; deadline?: string; projectId?: string }) =>
    authFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }, token),

  deleteTask: (token: string, id: string) =>
    authFetch(`/tasks/${id}`, { method: 'DELETE' }, token),

  getTasksStats: (token: string) =>
    authFetch('/tasks/stats', {}, token),
  getUrgentTasks: (token: string) =>
    authFetch('/tasks/urgent', {}, token),


  // PROJECT API FUNCTIONS
  getProjects: (token: string) =>
    authFetch('/tasks/projects', {}, token),

  createProject: (token: string, project: { name: string; color?: string }) =>
    authFetch('/tasks/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    }, token),

  updateProject: (token: string, id: string, project: { name?: string; color?: string }) =>
    authFetch(`/tasks/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    }, token),

  deleteProject: (token: string, id: string) =>
    authFetch(`/tasks/projects/${id}`, { method: 'DELETE' }, token),

  // Task Comments endpoints
  getTaskComments: (token: string, taskId: string) =>
    authFetch(`/tasks/${taskId}/comments`, {}, token),

  createTaskComment: (token: string, taskId: string, data: {
    content: string;
    repliedToCommentId?: string;
    fileIds?: string[];
  }) =>
    authFetch(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, token),

  updateTaskComment: (token: string, commentId: string, data: { content: string }) =>
    authFetch(`/tasks/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, token),

  deleteTaskComment: (token: string, commentId: string) =>
    authFetch(`/tasks/comments/${commentId}`, {
      method: 'DELETE'
    }, token),

  addReaction: (token: string, commentId: string, emoji: string) =>
    authFetch(`/comments/${commentId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    }, token),

  removeReaction: (token: string, commentId: string, emoji: string) =>
    authFetch(`/comments/${commentId}/reactions`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji })
    }, token),

  getCommentReactions: (token: string, commentId: string) =>
    authFetch(`/comments/${commentId}/reactions`, {}, token),


  uploadFile: (token: string, formData: FormData) =>
    fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(handleResponse),

  uploadNoteFile: (token: string, formData: FormData) =>
    fetch(`${API_BASE_URL}/files/upload-note`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(handleResponse),
  getFile: (token: string, filename: string) =>
    fetch(`${API_BASE_URL}/files/${filename}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(handleResponse),

  deleteAttachment: (token: string, attachmentId: string) =>
    fetch(`${API_BASE_URL}/files/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(handleResponse),

  getTaskFiles: (token: string, taskId: string) =>
    authFetch(`/files/tasks/${taskId}/files`, {}, token),

  deleteFile: (token: string, fileId: string) =>
    authFetch(`/files/${fileId}`, { method: 'DELETE' }, token),


  uploadAvatar: (token: string, formData: FormData) =>
    fetch(`${API_BASE_URL}/avatars/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(handleResponse),

  //Update user profile (if you want to add name/email updates later)
  updateProfile: (token: string, data: { name?: string; email?: string }) =>
    authFetch('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }, token),

  getTasksWithNewMessages: (token: string) =>
    authFetch('/tasks/has-new-messages', {}, token),

  updateTaskLastRead: (token: string, taskId: string) =>
    authFetch(`/tasks/${taskId}/last-read`, { method: 'POST' }, token),

  // user note preferences like the fav and tags 
  toggleFavorite: (token: string, noteId: string, isFavorite: boolean) =>
    authFetch(`/user-preferences/notes/${noteId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ isFavorite })
    }, token),

  addPersonalTag: (token: string, noteId: string, tag: string) =>
    authFetch(`/user-preferences/notes/${noteId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tag })
    }, token),

  removePersonalTag: (token: string, noteId: string, tag: string) =>
    authFetch(`/user-preferences/notes/${noteId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tag })
    }, token),
  getSidebarTags: (token: string) =>
    authFetch('/user/sidebar-tags', { method: 'GET' }, token),

  addSidebarTag: (token: string, tag: string) =>
    authFetch('/user/sidebar-tags', {
      method: 'POST',
      body: JSON.stringify({ tag })
    }, token),

  removeSidebarTag: (token: string, tag: string) =>
    authFetch('/user/sidebar-tags', {
      method: 'DELETE',
      body: JSON.stringify({ tag })
    }, token),

  updateName: (token: string, name: string) =>
    authFetch('/profile/update-profile/name', {
      method: 'PATCH',
      body: JSON.stringify({ name })
    }, token),

  updateEmail: (token: string, email: string) =>
    authFetch('/profile/update-profile/email', {
      method: 'PATCH',
      body: JSON.stringify({ email })
    }, token),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    authFetch('/profile/update-profile/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword })
    }, token),

  deleteAccount: (token: string) =>
    authFetch('/profile/update-profile/account', {
      method: 'DELETE'
    }, token),


  getTaskAnalytics: (token: string) =>
    authFetch('/tasks/analytics', {}, token),

  getAIConversation: (token: string) =>
    authFetch('/ai/assistant', {}, token),

  saveConversation: (token: string, data: any) =>
    authFetch('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify(data)
    }, token),

  getAIResponse: (token: string, message: any) =>
    authFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    }, token),

  clearAIConversation: (token: string) =>
    authFetch('/ai/assistant', {
      method: 'DELETE'
    }, token),

  getRecentActivities: (token: string, limit: number = 10) =>
    authFetch(`/activities${buildQueryParams({ limit })}`, {}, token),

  markActivityAsRead: (token: string, activityId: string) =>
    authFetch(`/activities/${activityId}/read`, {
      method: 'PATCH'
    }, token),

  markAllActivitiesAsRead: (token: string) =>
    authFetch('/activities/mark-all-read', {
      method: 'PATCH'
    }, token),


};

