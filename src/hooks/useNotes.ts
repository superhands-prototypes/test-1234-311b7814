import { useState, useEffect, useCallback } from 'react';
import { Note, Folder } from '../types';

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Notes', icon: '📝', isSystem: true },
  { id: 'notes', name: 'Notes', icon: '📁', isSystem: true },
  { id: 'recently-deleted', name: 'Recently Deleted', icon: '🗑️', isSystem: true },
];

const STORAGE_KEY = 'ios-notes-data';

interface StoredData {
  notes: Note[];
  folders: Folder[];
}

const loadFromStorage = (): StoredData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        notes: data.notes || [],
        folders: data.folders || DEFAULT_FOLDERS,
      };
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return { notes: [], folders: DEFAULT_FOLDERS };
};

const saveToStorage = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    const { notes: storedNotes, folders: storedFolders } = loadFromStorage();
    setNotes(storedNotes);
    setFolders(storedFolders.length > 0 ? storedFolders : DEFAULT_FOLDERS);
    setIsLoaded(true);
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({ notes, folders });
    }
  }, [notes, folders, isLoaded]);

  const createNote = useCallback((folderId?: string) => {
    const targetFolder = folderId || (selectedFolderId === 'all' || selectedFolderId === 'recently-deleted' ? 'notes' : selectedFolderId);
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      content: '',
      folderId: targetFolder,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    return newNote;
  }, [selectedFolderId]);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        const content = updates.content ?? note.content;
        const lines = content.split('\n');
        const title = lines[0] || 'New Note';
        return {
          ...note,
          ...updates,
          title,
          updatedAt: Date.now(),
        };
      }
      return note;
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (note.folderId === 'recently-deleted') {
      // Permanently delete
      setNotes(prev => prev.filter(n => n.id !== id));
    } else {
      // Move to recently deleted
      updateNote(id, { folderId: 'recently-deleted' });
    }

    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  }, [notes, selectedNoteId, updateNote]);

  const restoreNote = useCallback((id: string) => {
    updateNote(id, { folderId: 'notes' });
  }, [updateNote]);

  const togglePinNote = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() } : note
    ));
  }, []);

  const createFolder = useCallback((name: string, icon: string = '📁') => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      icon,
      isSystem: false,
    };
    setFolders(prev => [...prev.slice(0, -1), newFolder, prev[prev.length - 1]]);
    return newFolder;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    const folder = folders.find(f => f.id === id);
    if (!folder || folder.isSystem) return;

    // Move notes to default folder
    setNotes(prev => prev.map(note => 
      note.folderId === id ? { ...note, folderId: 'notes' } : note
    ));
    setFolders(prev => prev.filter(f => f.id !== id));

    if (selectedFolderId === id) {
      setSelectedFolderId('all');
    }
  }, [folders, selectedFolderId]);

  const getFilteredNotes = useCallback(() => {
    let filtered = notes;

    // Filter by folder
    if (selectedFolderId === 'all') {
      filtered = filtered.filter(n => n.folderId !== 'recently-deleted');
    } else {
      filtered = filtered.filter(n => n.folderId === selectedFolderId);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.content.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, selectedFolderId, searchQuery]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;
  const filteredNotes = getFilteredNotes();

  const getFolderNoteCount = useCallback((folderId: string) => {
    if (folderId === 'all') {
      return notes.filter(n => n.folderId !== 'recently-deleted').length;
    }
    return notes.filter(n => n.folderId === folderId).length;
  }, [notes]);

  return {
    notes: filteredNotes,
    folders,
    selectedNote,
    selectedFolderId,
    selectedNoteId,
    searchQuery,
    setSearchQuery,
    setSelectedFolderId,
    setSelectedNoteId,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    togglePinNote,
    createFolder,
    deleteFolder,
    getFolderNoteCount,
  };
};
