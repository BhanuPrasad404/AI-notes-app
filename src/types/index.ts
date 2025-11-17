// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

// Note types
export interface Note {
  sharedNotes: boolean;
  id: string;
  title: string;
  content: string;
  aiSummary?: string;
  aiTags: string[];
  contentType: 'text' | 'richText';
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  attachments?: NoteAttachment[];
  permissions?: {
    isOwner: boolean;
    canEdit: boolean;
    canDelete: boolean;
    permissionLevel: 'OWNER' | 'EDIT' | 'VIEW' | 'NONE';
    sharedAt?: string;
  };
  userPreferences?: UserNotePreferences[];
}
export interface UserNotePreferences {
  isFavorite: boolean;
  personalTags: string[];
}

//  MISSING: Shared Note Type
export interface SharedNote {
  id: string;
  noteId: string;
  sharedWithUserId: string;
  permission: 'VIEW' | 'EDIT';
  sharedAt: string;
  sharedWith?: User;
  note?: Note;
}

// Task types
export interface Task {

  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  urgency?: string;
  user?: User;
  project?: {
    id: string;
    name: string;
    color: string;
  };
}

// Auth types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

//  MISSING: API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotesResponse {
  notes: Note[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    total: number;
  };
}

export interface TasksStats {
  stats: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    total: number;
    overdue: number;
  };
}

export interface SharedNotesResponse {
  message: string;
  notes: (Note & {
    owner: User;
    sharedInfo: {
      sharedAt: string;
      permission: string;
      sharedNoteId: string;
    };
  })[];
  count: number;
}

// AI Response Types
export interface AIResponse {
  success: boolean;
  originalContent: string;
  summary?: string;
  actionItems?: string[];
  enhancedContent?: string;
  noteId?: string;
}

export interface AIHealthResponse {
  service: string;
  timestamp: string;
  healthy: boolean;
  hasMistral?: boolean;
  models?: string[];
  error?: string;
}

//   Real-time Collaboration Types
export interface CollaborationUser {
  userId: string;
  user: User;
  position?: {
    x: number;
    y: number;
  };
  isTyping?: boolean;
}

export interface NoteUpdateData {
  noteId: string;
  content: string;
  cursorPosition?: number;
  updatedBy: User;
  timestamp: string;
}

//  Form/Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;



}

export interface CreateNoteRequest {
  title: string;
  content: string;
  contentType?: 'text' | 'richText';
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface ShareNoteRequest {
  sharedWithEmail: string;
  permission: 'VIEW' | 'EDIT';
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline?: string;
}

export interface AIRequest {
  content: string;
  noteId?: string;
}

export interface CollaborationUser {
  userId: string;
  user: User;
  position?: {
    x: number;
    y: number;
  };
  isTyping?: boolean;

}

export interface CursorPosition {
  x: number;
  y: number;
}

export interface UserCursor {
  userId: string;
  user: User;
  position: CursorPosition;
}

export interface TypingUser {
  userId: string;
  user: User;
  isTyping: boolean;
}
export interface ExportOptions {
  includeDescription: boolean;
  includeMetadata: boolean;
}

// Comment types
export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    avatarUrl?: any;
    id: string;
    name: string;
    email: string;
  };
  fileAttachments?: FileAttachment[];

  repliedToCommentId?: string;
  repliedToContent?: string;
  repliedToUserId?: string;
  repliedToUserName?: string;
  repliedToUserEmail?: string;
  repliedToCreatedAt?: string;
  repliedToFileAttachments?: FileAttachment[];

  repliedTo?: {
    id: string;
    content: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  };
  reactions?: Reaction[];
  reactionSummary?: { [emoji: string]: number };
}

// Also update your API response type
export interface CommentsResponse {
  message: string;
  comments: TaskComment[];
  count: number;
}
export interface CommentsResponse {
  message: string;
  comments: TaskComment[];
  count: number;
}
export interface Reaction {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user?: User;
}

export interface FileAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  userId: string;
  commentId?: string;
  createdAt: string;
  user?: User;
  isLocal?: boolean
}
export interface NoteAttachment {
  isTemp: boolean;
  id: string;
  noteId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  note?: {
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    }
  };
}


export interface TemporaryAttachment extends Omit<NoteAttachment, 'id' | 'createdAt'> {
  id: string;
  file?: File;
  isUploading?: boolean;
  progress?: number;
}

export interface SharedTask extends Task {
  sharedInfo?: {
    sharedAt: string;
    permission: 'VIEW' | 'EDIT';
    sharedTaskId: string;
    sharedBy: {
      id: string;
      name: string;
      email: string;
    };
  };

  hasNewMessages?: boolean;
}


interface CollaborationStats {
  totalCollaborators: number;
  totalCollaborations: number;
  noteCollaborations: number;
  taskCollaborations: number;
}

