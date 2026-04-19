import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useConfig from '../../../hooks/useConfig';
import fileApi from '../../../services/api/fileApi';

const FilePreviewModal = ({ file, onClose }) => {
  const { config, loading: configLoading } = useConfig();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
  
  // Construct absolute URL
  const getFullUrl = (targetUrl) => {
    if (!targetUrl) return '';
    if (targetUrl.startsWith('http')) return targetUrl;
    
    // Fallback to relative URL if no config yet
    if (!config?.backend_url) return targetUrl;

    const baseUrl = config.backend_url;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    
    return `${cleanBase}${cleanPath}`;
  };

  const mainUrl = getFullUrl(file.url);
  // Add ?preview=true to download URL for inline disposition
  const rawDownloadUrl = file.downloadUrl || (file._id ? `/api/v1/files/${file._id}` : file.url);
  const downloadUrl = getFullUrl(rawDownloadUrl) + (rawDownloadUrl.includes('?') ? '&' : '?') + 'preview=true';

  useEffect(() => {
    const isTextBased = ['html', 'md', 'txt', 'js', 'css', 'json'].includes(fileExt);
    if (!isTextBased || !downloadUrl || configLoading) return;

    let cancelled = false;

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const text = await fileApi.getFileContent(downloadUrl);
        if (!cancelled) setContent(text);
      } catch (err) {
        console.error('FilePreviewModal: Error fetching file content:', err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContent();

    return () => { cancelled = true; };
  }, [file, fileExt, downloadUrl, configLoading]);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500 text-center p-4">
          <span className="text-4xl mb-4">⚠️</span>
          <p className="font-semibold">{error}</p>
          <p className="text-sm mt-2 text-gray-500">Try downloading the file instead.</p>
        </div>
      );
    }

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExt)) {
      return (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg overflow-auto max-h-[70vh]">
          <img 
            src={mainUrl} 
            alt={file.name} 
            className="max-w-full h-auto shadow-sm rounded border border-gray-200"
            onError={(e) => {
              if (e.target.src !== downloadUrl) {
                e.target.src = downloadUrl;
              }
            }}
          />
        </div>
      );
    }

    // PDF
    if (fileExt === 'pdf') {
      return (
        <div className="w-full h-[70vh] border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            src={`${downloadUrl}#toolbar=0`}
            title={file.name}
            className="w-full h-full"
            frameBorder="0"
          />
        </div>
      );
    }

    // HTML
    if (fileExt === 'html') {
      return (
        <div className="w-full h-[70vh] border border-gray-200 rounded-lg overflow-hidden bg-white">
          <iframe
            srcDoc={content || ''}
            title={file.name}
            className="w-full h-full"
            frameBorder="0"
            sandbox="allow-same-origin"
          />
        </div>
      );
    }

    // Markdown
    if (fileExt === 'md') {
      return (
        <div className="prose prose-blue prose-sm sm:prose-base max-w-none p-6 bg-white border border-gray-200 rounded-lg overflow-y-auto max-h-[70vh] text-left">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || ''}
          </ReactMarkdown>
        </div>
      );
    }

    // Other Text
    if (['txt', 'js', 'css', 'json'].includes(fileExt)) {
      return (
        <div className="p-4 bg-gray-900 rounded-lg overflow-y-auto max-h-[70vh] text-left">
          <pre className="text-blue-400 font-mono text-sm whitespace-pre-wrap">
            {content || ''}
          </pre>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">Preview not available for this file type.</p>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">{fileExt}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 truncate max-w-md" title={file.name}>
                {file.name}
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                {fileExt} file • {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {renderPreview()}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <a
            href={(() => {
              try {
                const u = new URL(downloadUrl);
                u.searchParams.set('preview', 'false');
                u.searchParams.set('download', 'true');
                return u.toString();
              } catch {
                return downloadUrl;
              }
            })()}
            target="_blank"
            download={file.name}
            rel="noreferrer"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md flex items-center gap-2"
          >
            <span>📥</span> Download Original
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
