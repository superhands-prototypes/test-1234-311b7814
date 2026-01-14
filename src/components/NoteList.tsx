import React from 'react';
import { Note, Folder } from '../types';

interface NoteListProps {
  notes: Note[];
  folders: Folder[];
  selectedNoteId: string | null;
  selectedFolderId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 'var(--note-list-width)',
    height: '100%',
    background: '#FFFFFF',
    borderRight: '1px solid var(--ios-separator)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid var(--ios-separator)',
  },
  folderTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--ios-text-primary)',
    marginBottom: '12px',
    letterSpacing: '-0.3px',
  },
  searchContainer: {
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    color: 'var(--ios-text-secondary)',
    pointerEvents: 'none' as const,
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    fontSize: '15px',
    background: 'var(--ios-gray-light)',
    borderRadius: '10px',
    color: 'var(--ios-text-primary)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    borderBottom: '1px solid var(--ios-separator)',
  },
  noteCount: {
    fontSize: '13px',
    color: 'var(--ios-text-secondary)',
    fontWeight: 500,
  },
  newNoteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--ios-orange)',
    transition: 'all 0.15s ease',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },
  noteItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--ios-separator)',
    transition: 'all 0.15s ease',
    position: 'relative' as const,
  },
  noteItemSelected: {
    background: 'rgba(255, 149, 0, 0.1)',
  },
  noteTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--ios-text-primary)',
    marginBottom: '4px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pinIcon: {
    fontSize: '12px',
    color: 'var(--ios-orange)',
  },
  notePreview: {
    fontSize: '14px',
    color: 'var(--ios-text-secondary)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '4px',
  },
  noteDate: {
    fontSize: '12px',
    color: 'var(--ios-text-secondary)',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--ios-text-primary)',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: 'var(--ios-text-secondary)',
  },
  contextMenu: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '4px',
    opacity: 0,
    transition: 'opacity 0.15s ease',
  },
  contextButton: {
    padding: '6px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    transition: 'all 0.15s ease',
  },
  sectionHeader: {
    padding: '8px 16px 4px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--ios-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    background: 'var(--ios-gray-light)',
  },
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const getPreview = (content: string): string => {
  const lines = content.split('\n').filter(line => line.trim());
  return lines[1] || 'No additional text';
};

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  folders,
  selectedNoteId,
  selectedFolderId,
  searchQuery,
  onSearchChange,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRestoreNote,
  onTogglePin,
}) => {
  const [hoveredNote, setHoveredNote] = React.useState<string | null>(null);

  const currentFolder = folders.find(f => f.id === selectedFolderId);
  const isRecentlyDeleted = selectedFolderId === 'recently-deleted';

  const pinnedNotes = notes.filter(n => n.isPinned);
  const unpinnedNotes = notes.filter(n => !n.isPinned);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.folderTitle}>
          {currentFolder?.icon} {currentFolder?.name || 'Notes'}
        </h2>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.toolbar}>
        <span style={styles.noteCount}>
          {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
        </span>
        {!isRecentlyDeleted && (
          <button
            style={styles.newNoteButton}
            onClick={onCreateNote}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 149, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>✏️</span>
            New Note
          </button>
        )}
      </div>

      {notes.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            {isRecentlyDeleted ? '🗑️' : '📝'}
          </div>
          <h3 style={styles.emptyTitle}>
            {isRecentlyDeleted ? 'No Deleted Notes' : 'No Notes'}
          </h3>
          <p style={styles.emptySubtitle}>
            {isRecentlyDeleted 
              ? 'Deleted notes will appear here'
              : 'Tap the New Note button to create one'}
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {pinnedNotes.length > 0 && (
            <>
              <div style={styles.sectionHeader}>Pinned</div>
              {pinnedNotes.map((note, index) => (
                <NoteItemComponent
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={selectedNoteId === note.id}
                  isHovered={hoveredNote === note.id}
                  isRecentlyDeleted={isRecentlyDeleted}
                  onSelect={() => onSelectNote(note.id)}
                  onMouseEnter={() => setHoveredNote(note.id)}
                  onMouseLeave={() => setHoveredNote(null)}
                  onDelete={() => onDeleteNote(note.id)}
                  onRestore={() => onRestoreNote(note.id)}
                  onTogglePin={() => onTogglePin(note.id)}
                />
              ))}
            </>
          )}
          {unpinnedNotes.length > 0 && pinnedNotes.length > 0 && (
            <div style={styles.sectionHeader}>Notes</div>
          )}
          {unpinnedNotes.map((note, index) => (
            <NoteItemComponent
              key={note.id}
              note={note}
              index={index + pinnedNotes.length}
              isSelected={selectedNoteId === note.id}
              isHovered={hoveredNote === note.id}
              isRecentlyDeleted={isRecentlyDeleted}
              onSelect={() => onSelectNote(note.id)}
              onMouseEnter={() => setHoveredNote(note.id)}
              onMouseLeave={() => setHoveredNote(null)}
              onDelete={() => onDeleteNote(note.id)}
              onRestore={() => onRestoreNote(note.id)}
              onTogglePin={() => onTogglePin(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NoteItemProps {
  note: Note;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  isRecentlyDeleted: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onTogglePin: () => void;
}

const NoteItemComponent: React.FC<NoteItemProps> = ({
  note,
  index,
  isSelected,
  isHovered,
  isRecentlyDeleted,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onDelete,
  onRestore,
  onTogglePin,
}) => (
  <div
    style={{
      ...styles.noteItem,
      ...(isSelected ? styles.noteItemSelected : {}),
      animation: `slideUp 0.3s ease ${index * 0.03}s both`,
    }}
    onClick={onSelect}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div style={styles.noteTitle}>
      {note.isPinned && <span style={styles.pinIcon}>📌</span>}
      {note.title || 'New Note'}
    </div>
    <div style={styles.notePreview}>{getPreview(note.content)}</div>
    <div style={styles.noteDate}>{formatDate(note.updatedAt)}</div>
    <div style={{ ...styles.contextMenu, opacity: isHovered ? 1 : 0 }}>
      {isRecentlyDeleted ? (
        <button
          style={{ ...styles.contextButton, color: 'var(--ios-blue)' }}
          onClick={(e) => { e.stopPropagation(); onRestore(); }}
          title="Restore"
        >
          ↩️
        </button>
      ) : (
        <button
          style={{ ...styles.contextButton, color: 'var(--ios-orange)' }}
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          title={note.isPinned ? 'Unpin' : 'Pin'}
        >
          📌
        </button>
      )}
      <button
        style={{ ...styles.contextButton, color: 'var(--ios-red)' }}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete"
      >
        🗑️
      </button>
    </div>
  </div>
);
