"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function DocumentsSection({ loanId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [loanId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/loan-documents?loanId=${loanId}`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (doc) => {
    if (doc.mime_type?.startsWith('image/')) {
      setPreviewImage(doc);
    }
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handleDelete = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/loan-documents?id=${documentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Document deleted successfully!");
        fetchDocuments();
      } else {
        toast.error(data.message || "Failed to delete document");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const getDocumentUrl = (documentName) => {
    return `/api/documents/${documentName}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="animate-in fade-in-50 duration-500 delay-400">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents</h4>
        <div className="flex items-center justify-center h-16">
          <div className="text-gray-500 text-sm">Loading documents...</div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="animate-in fade-in-50 duration-500 delay-400">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents</h4>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm text-center">No documents uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <img
                src={getDocumentUrl(previewImage.document_name)}
                alt={previewImage.original_name}
                className="max-w-full max-h-[70vh] object-contain"
              />
              <div className="mt-4 text-center">
                <p className="font-medium text-gray-900">{previewImage.original_name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(previewImage.file_size)} • {new Date(previewImage.created_at).toLocaleDateString('en-IN')}
                </p>
                <a
                  href={getDocumentUrl(previewImage.document_name)}
                  download={previewImage.original_name}
                  className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="animate-in fade-in-50 duration-500 delay-400">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents</h4>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <div className="text-gray-500 text-sm">Loading documents...</div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {doc.mime_type?.startsWith('image/') ? (
                    <div
                      onClick={() => handleImageClick(doc)}
                      className="cursor-pointer group relative overflow-hidden rounded-lg border border-gray-300"
                    >
                      <img
                        src={getDocumentUrl(doc.document_name)}
                        alt={doc.original_name}
                        className="w-[100px] h-[100px] object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA2QzkuNzkwODYgNiA4IDcuNzkwODYgOCAxMEM4IDEyLjIwOTEgOS43OTA4NiAxNCAxMiAxNEMxNC4yMDkxIDE0IDE2IDEyLjIwOTEgMTYgMTBDMTYgNy43OTA4NiAxNC4yMDkxIDYgMTIgNlpNMTIgMTJDMTMuMTA0NiAxMiAxNCAxMS4xMDQ2IDE0IDEwQzE0IDguODk1NDMgMTMuMTA0NiA4IDEyIDhDMTAuODk1NCA4IDEwIDguODk1NDMgMTAgMTBDMTAgMTEuMTA0NiAxMC44OTU0IDEyIDEyIDEyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                      {/* Download Icon */}
                      <a
                        href={getDocumentUrl(doc.document_name)}
                        download={doc.original_name}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 z-10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      {/* Delete Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                        className="absolute top-2 right-12 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 z-10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">
                        {doc.mime_type?.includes('pdf') ? '📄' :
                          doc.mime_type?.includes('word') || doc.mime_type?.includes('document') ? '📝' :
                            doc.mime_type?.includes('excel') || doc.mime_type?.includes('spreadsheet') ? '📊' : '📎'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 truncate">{doc.original_name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
