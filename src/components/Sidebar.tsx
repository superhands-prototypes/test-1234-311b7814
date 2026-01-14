import React, { useState } from 'react';
import { Folder } from '../types';

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onCreateFolder: (name: string, icon: string) => void;
  onDeleteFolder: (id: string) => void;
  getFolderNoteCount: (id: string) => number;
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100%',
    background: 'linear-gradient(180deg, #F9F9FB 0%, #F2F2F7 100%)',
    borderRight: '1px solid var(--ios-separator)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    padding: '20px 16px 12px',
    borderBottom: '1px solid var(--ios-separator)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--ios-text-primary)',
    letterSpacing: '-0.5px',
  },
  folderList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },
  section: {
    padding: '8px 16px 4px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--ios-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  folderItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    cursor: 'pointer',
    borderRadius: '10px',
    margin: '2px 8px',
    transition: 'all 0.15s ease',
    position: 'relative' as const,
  },
  folderItemSelected: {
    background: 'rgba(255, 149, 0, 0.15)',
  },
  folderIcon: {
    fontSize: '20px',
    marginRight: '12px',
    width: '24px',
    textAlign: 'center' as const,
  },
  folderName: {
    flex: 1,
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--ios-text-primary)',
  },
  folderNameSelected: {
    color: 'var(--ios-orange)',
  },
  folderCount: {
    fontSize: '14px',
    color: 'var(--ios-text-secondary)',
    fontWeight: 500,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    margin: '8px',
    borderRadius: '10px',
    background: 'rgba(0, 122, 255, 0.1)',
    color: 'var(--ios-blue)',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.15s ease',
  },
  modal: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  modalContent: {
    background: 'white',
    borderRadius: '14px',
    padding: '24px',
    width: '300px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideUp 0.3s ease',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid var(--ios-separator)',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
  },
  modalButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    transition: 'all 0.15s ease',
  },
  cancelButton: {
    background: 'var(--ios-gray-light)',
    color: 'var(--ios-text-primary)',
  },
  createButton: {
    background: 'var(--ios-blue)',
    color: 'white',
  },
  deleteButton: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    opacity: 0,
    fontSize: '14px',
    color: 'var(--ios-red)',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'opacity 0.15s ease',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  getFolderNoteCount,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), '📁');
      setNewFolderName('');
      setShowModal(false);
    }
  };

  const systemFolders = folders.filter(f => f.isSystem && f.id !== 'recently-deleted');
  const userFolders = folders.filter(f => !f.isSystem);
  const recentlyDeleted = folders.find(f => f.id === 'recently-deleted');

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h1 style={styles.title}>Folders</h1>
      </div>

      <div style={styles.folderList}>
        {/* System Folders */}
        <div style={styles.section}>
          {systemFolders.map(folder => (
            <div
              key={folder.id}
              style={{
                ...styles.folderItem,
                ...(selectedFolderId === folder.id ? styles.folderItemSelected : {}),
              }}
              onClick={() => onSelectFolder(folder.id)}
              onMouseEnter={() => setHoveredFolder(folder.id)}
              onMouseLeave={() => setHoveredFolder(null)}
            >
              <span style={styles.folderIcon}>{folder.icon}</span>
              <span style={{
                ...styles.folderName,
                ...(selectedFolderId === folder.id ? styles.folderNameSelected : {}),
              }}>
                {folder.name}
              </span>
              <span style={styles.folderCount}>{getFolderNoteCount(folder.id)}</span>
            </div>
          ))}
        </div>

        {/* User Folders */}
        {userFolders.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>My Folders</div>
            {userFolders.map(folder => (
              <div
                key={folder.id}
                style={{
                  ...styles.folderItem,
                  ...(selectedFolderId === folder.id ? styles.folderItemSelected : {}),
                }}
                onClick={() => onSelectFolder(folder.id)}
                onMouseEnter={() => setHoveredFolder(folder.id)}
                onMouseLeave={() => setHoveredFolder(null)}
              >
                <span style={styles.folderIcon}>{folder.icon}</span>
                <span style={{
                  ...styles.folderName,
                  ...(selectedFolderId === folder.id ? styles.folderNameSelected : {}),
                }}>
                  {folder.name}
                </span>
                <span style={styles.folderCount}>{getFolderNoteCount(folder.id)}</span>
                {!folder.isSystem && (
                  <button
                    style={{
                      ...styles.deleteButton,
                      opacity: hoveredFolder === folder.id ? 1 : 0,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recently Deleted */}
        {recentlyDeleted && (
          <div style={{ ...styles.section, marginTop: '16px' }}>
            <div
              style={{
                ...styles.folderItem,
                ...(selectedFolderId === recentlyDeleted.id ? styles.folderItemSelected : {}),
              }}
              onClick={() => onSelectFolder(recentlyDeleted.id)}
            >
              <span style={styles.folderIcon}>{recentlyDeleted.icon}</span>
              <span style={{
                ...styles.folderName,
                ...(selectedFolderId === recentlyDeleted.id ? styles.folderNameSelected : {}),
              }}>
                {recentlyDeleted.name}
              </span>
              <span style={styles.folderCount}>{getFolderNoteCount(recentlyDeleted.id)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        style={styles.addButton}
        onClick={() => setShowModal(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 122, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 122, 255, 0.1)';
        }}
      >
        + New Folder
      </button>

      {/* New Folder Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              style={styles.input}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowModal(false);
              }}
            />
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.createButton }}
                onClick={handleCreateFolder}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
