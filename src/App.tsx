import React from 'react';
import { useNotes } from './hooks/useNotes';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
};

export default function App() {
  const {
    notes,
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
  } = useNotes();

  return (
    <div style={styles.app}>
      <Sidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        getFolderNoteCount={getFolderNoteCount}
      />
      <NoteList
        notes={notes}
        folders={folders}
        selectedNoteId={selectedNoteId}
        selectedFolderId={selectedFolderId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectNote={setSelectedNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onRestoreNote={restoreNote}
        onTogglePin={togglePinNote}
      />
      <NoteEditor
        note={selectedNote}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onTogglePin={togglePinNote}
      />
    </div>
  );
}
