import React, { useEffect, useRef, useState } from 'react';
import { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, #FFFEF8 0%, #FFF9E6 100%)',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center' as const,
    background: 'linear-gradient(180deg, #FFFEF8 0%, #FFF9E6 100%)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: 'var(--ios-text-primary)',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '15px',
    color: 'var(--ios-text-secondary)',
    maxWidth: '300px',
    lineHeight: 1.5,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: '1px solid rgba(60, 60, 67, 0.08)',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  toolbarButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--ios-text-secondary)',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dateInfo: {
    fontSize: '13px',
    color: 'var(--ios-text-secondary)',
    fontWeight: 500,
  },
  editorWrapper: {
    flex: 1,
    overflow: 'auto',
    padding: '24px 32px',
  },
  paper: {
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '100%',
    position: 'relative' as const,
  },
  paperLines: {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(200, 180, 140, 0.2) 31px, rgba(200, 180, 140, 0.2) 32px)',
    backgroundPosition: '0 0',
  },
  textarea: {
    width: '100%',
    minHeight: '100%',
    resize: 'none' as const,
    fontSize: '17px',
    lineHeight: '32px',
    color: 'var(--ios-text-primary)',
    background: 'transparent',
    fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif",
    position: 'relative' as const,
    zIndex: 1,
  },
  wordCount: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    padding: '8px 14px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'var(--ios-text-secondary)',
    fontWeight: 500,
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },
};

const formatFullDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (note) {
      setLocalContent(note.content);
      // Focus textarea when note changes
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Place cursor at end
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 100);
    }
  }, [note?.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);

    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (note) {
        onUpdateNote(note.id, { content: newContent });
      }
    }, 300);
  };

  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0;
  const charCount = localContent.length;

  if (!note) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📝</div>
        <h3 style={styles.emptyTitle}>Select a Note</h3>
        <p style={styles.emptySubtitle}>
          Choose a note from the list to view and edit, or create a new note to get started.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <span style={styles.dateInfo}>
            {formatFullDate(note.updatedAt)}
          </span>
        </div>
        <div style={styles.toolbarRight}>
          <button
            style={{
              ...styles.toolbarButton,
              color: note.isPinned ? 'var(--ios-orange)' : 'var(--ios-text-secondary)',
            }}
            onClick={() => onTogglePin(note.id)}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            📌 {note.isPinned ? 'Pinned' : 'Pin'}
          </button>
          <button
            style={{ ...styles.toolbarButton, color: 'var(--ios-red)' }}
            onClick={() => onDeleteNote(note.id)}
            title="Delete note"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div style={styles.editorWrapper}>
        <div style={styles.paper}>
          <div style={styles.paperLines} />
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            placeholder="Start typing..."
            style={styles.textarea}
            spellCheck
          />
        </div>
      </div>

      <div style={styles.wordCount}>
        {wordCount} words · {charCount} characters
      </div>
    </div>
  );
};
