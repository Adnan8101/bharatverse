'use client';
import { useState } from 'react';
import { Download, Eye, FileText, Image, File } from 'lucide-react';

export default function MediaViewer({ file, messageId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (type === 'application/pdf') {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  return (
    <>
      <div className="max-w-xs bg-gray-50 border rounded-lg p-3 mt-2">
        {isImage ? (
          <div className="space-y-2">
            <img
              src={file.url}
              alt={file.originalName}
              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsModalOpen(true)}
            />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="truncate flex-1 mr-2">{file.originalName}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="View"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded">
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.originalName}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
            <div className="flex space-x-1">
              {isPDF && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="View"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="p-1 hover:bg-gray-200 rounded"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for viewing files */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{file.originalName}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Download
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4">
              {isImage ? (
                <img
                  src={file.url}
                  alt={file.originalName}
                  className="max-w-full h-auto"
                />
              ) : isPDF ? (
                <iframe
                  src={file.url}
                  className="w-full h-96"
                  title={file.originalName}
                />
              ) : (
                <div className="text-center py-8">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Preview not available for this file type.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
