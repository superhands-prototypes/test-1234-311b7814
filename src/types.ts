export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  isSystem: boolean;
  color?: string;
}

export type ViewMode = 'list' | 'edit';
