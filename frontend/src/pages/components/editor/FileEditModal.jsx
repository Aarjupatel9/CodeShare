import React, { useState, useEffect, useCallback, useRef } from 'react';
import useConfig from '../../../hooks/useConfig';
import fileApi from '../../../services/api/fileApi';
import toast from 'react-hot-toast';

/**
 * Extensions that can be edited in the browser.
 * Must stay in sync with EDITABLE_EXTENSIONS on the backend.
 */
export const EDITABLE_EXTENSIONS = new Set([
  'html', 'htm', 'md', 'txt',
  'js', 'jsx', 'ts', 'tsx',
  'css', 'scss', 'less',
  'json', 'xml', 'yaml', 'yml', 'csv',
  'java', 'py', 'rb', 'php', 'sh', 'c', 'cpp', 'go', 'rs', 'swift',
]);

export const isEditable = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop().toLowerCase();
  return EDITABLE_EXTENSIONS.has(ext);
};

// Simple syntax-theme map for textarea background cue (no heavy dep needed)
const LANG_LABEL = {
  html: 'HTML', htm: 'HTML', md: 'Markdown', txt: 'Plain Text',
  js: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX',
  css: 'CSS', scss: 'SCSS', less: 'LESS',
  json: 'JSON', xml: 'XML', yaml: 'YAML', yml: 'YAML', csv: 'CSV',
  java: 'Java', py: 'Python', rb: 'Ruby', php: 'PHP', sh: 'Shell',
  c: 'C', cpp: 'C++', go: 'Go', rs: 'Rust', swift: 'Swift',
};

const FileEditModal = ({ file, onClose, onSaved }) => {
  const { config, loading: configLoading } = useConfig();
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const fileExt = file?.name ? file.name.split('.').pop().toLowerCase() : '';
  const langLabel = LANG_LABEL[fileExt] || fileExt.toUpperCase();
  const hasChanges = content !== originalContent;

  // Construct absolute URL for fetching content
  const getFullUrl = useCallback((targetUrl) => {
    if (!targetUrl) return '';
    if (targetUrl.startsWith('http')) return targetUrl;
    if (!config?.backend_url) return targetUrl;
    const base = config.backend_url.endsWith('/') ? config.backend_url.slice(0, -1) : config.backend_url;
    const p = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    return `${base}${p}`;
  }, [config]);

  // Load file content on mount
  useEffect(() => {
    if (configLoading || !file) return;
    let cancelled = false;

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawUrl = file.downloadUrl || (file._id ? `/api/v1/files/${file._id}` : file.url);
        const u = new URL(getFullUrl(rawUrl));
        u.searchParams.set('preview', 'true');
        const text = await fileApi.getFileContent(u.toString());
        if (!cancelled) {
          setContent(text);
          setOriginalContent(text);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load file content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadContent();
    return () => { cancelled = true; };
  }, [file, configLoading, getFullUrl]);

  // Tab → insert 2 spaces
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = content.substring(0, start) + '  ' + content.substring(end);
      setContent(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
    // Ctrl/Cmd + S → save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!file?._id || saving) return;
    setSaving(true);
    try {
      const response = await fileApi.updateFileContent(file._id, content);
      if (response?.success) {
        setOriginalContent(content);
        toast.success('File saved successfully');
        if (onSaved) onSaved({ ...file, size: response.data?.size });
      } else {
        throw new Error(response?.message || 'Save failed');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to save file';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Discard and close?')) return;
    }
    onClose();
  };

  // Keyboard shortcut: Escape → close (only when no unsaved changes)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !hasChanges) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasChanges, onClose]);

  return (
    <div className="fixed inset-0 z-[1002] flex flex-col bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="flex flex-col bg-gray-950 w-full h-full max-h-screen">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl">✏️</span>
            <div className="min-w-0">
              <h2
                className="text-sm font-bold text-white truncate max-w-xs md:max-w-lg"
                title={file?.name}
              >
                {file?.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase tracking-widest text-blue-400 font-semibold bg-blue-900/40 px-1.5 py-0.5 rounded">
                  {langLabel}
                </span>
                {hasChanges && (
                  <span className="text-[10px] text-yellow-400 font-medium">● Unsaved changes</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || loading || !hasChanges}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition
                bg-blue-600 hover:bg-blue-500 text-white
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>💾 Save</>
              )}
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div className="flex items-center gap-4 px-4 py-1 bg-gray-900/80 border-b border-gray-800 text-[11px] text-gray-500 flex-shrink-0">
          <span>{content.split('\n').length} lines</span>
          <span>{content.length} chars</span>
          <span className="ml-auto">Tab: 2 spaces &nbsp;·&nbsp; Ctrl+S to save &nbsp;·&nbsp; Esc to close</span>
        </div>

        {/* ── Editor body ── */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Loading file…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <span className="text-4xl mb-4">⚠️</span>
              <p className="text-red-400 font-semibold text-sm mb-2">{error}</p>
              <p className="text-gray-500 text-xs">Only local-disk files can be edited in the browser.</p>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="w-full h-full resize-none bg-gray-950 text-gray-100 font-mono text-sm
                leading-relaxed p-4 focus:outline-none caret-blue-400
                selection:bg-blue-600/50"
              style={{ tabSize: 2 }}
              autoFocus
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileEditModal;
