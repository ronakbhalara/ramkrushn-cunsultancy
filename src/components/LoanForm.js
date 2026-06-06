"use client";

import { useState, useEffect } from "react";

export default function LoanForm({
  formData,
  setFormData,
  errors,
  onSubmit,
  onCancel,
  editingLoan,
}) {
  const [loanStatuses, setLoanStatuses] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingDocuments, setExistingDocuments] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    if (editingLoan) {
      fetchExistingDocuments();
    }
  }, [editingLoan]);

  const fetchDropdownData = async () => {
    try {
      const [statusResponse, typeResponse] = await Promise.all([
        fetch('/api/loan-status'),
        fetch('/api/loan-type')
      ]);

      const statusData = await statusResponse.json();
      const typeData = await typeResponse.json();

      if (statusData.success) {
        setLoanStatuses(statusData.data);
      }
      if (typeData.success) {
        setLoanTypes(typeData.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    
    files.forEach(file => {
      // Check file type (only PNG and JPG allowed)
      const isImage = file.type.startsWith('image/');
      const isValidType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
      
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const isValidSize = file.size <= maxSize;
      
      if (isImage && isValidType && isValidSize) {
        validFiles.push(file);
      } else {
        // Show error message for invalid files
        if (!isValidType) {
          alert(`File "${file.name}" is not supported. Only PNG and JPG images are allowed.`);
        } else if (!isValidSize) {
          alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
        }
      }
    });
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const fetchExistingDocuments = async () => {
    try {
      const response = await fetch(`/api/loan-documents?loanId=${editingLoan.id}`);
      const data = await response.json();
      if (data.success) {
        setExistingDocuments(data.data);
      }
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  const handleDeleteExistingDocument = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/loan-documents?id=${documentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        alert(data.message || "Failed to delete document");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const getDocumentUrl = (documentName) => {
    return `/api/documents/${documentName}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedFiles);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-[#1c3430] mb-4">
          {editingLoan ? "Edit Loan" : "Add New Loan"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone No *
              </label>
              <input
                type="text"
                required
                value={formData.phone_no}
                onChange={(e) =>
                  setFormData({ ...formData, phone_no: e.target.value })
                }
                placeholder="+91"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.phone_no ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.phone_no && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_no}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone No 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.phone_no_2 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone_no_2: e.target.value })
                }
                placeholder="+91"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.phone_no_2 ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.phone_no_2 && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_no_2}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID
              </label>
              <input
                type="email"
                value={formData.email_id}
                onChange={(e) =>
                  setFormData({ ...formData, email_id: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.email_id ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.email_id && (
                <p className="mt-1 text-sm text-red-600">{errors.email_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage *
              </label>
              <select
                required
                value={formData.stage}
                onChange={(e) =>
                  setFormData({ ...formData, stage: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETE">Complete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Status *
              </label>
              <select
                required
                value={formData.loan_status || ''}
                onChange={(e) =>
                  setFormData({ ...formData, loan_status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                disabled={loading}
              >
                <option value="">Select Loan Status</option>
                {loanStatuses.map((status) => (
                  <option key={status.id} value={status.status_name}>
                    {status.status_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Type *
              </label>
              <select
                required
                value={formData.loan_type || ''}
                onChange={(e) =>
                  setFormData({ ...formData, loan_type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                disabled={loading}
              >
                <option value="">Select Loan Type</option>
                {loanTypes.map((type) => (
                  <option key={type.id} value={type.type_name}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan A/C No
              </label>
              <input
                type="text"
                value={formData.loan_ac_no}
                onChange={(e) =>
                  setFormData({ ...formData, loan_ac_no: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount *
              </label>
              <input
                type="text"
                required
                value={formData.loan_amount ? `₹${parseFloat(formData.loan_amount).toLocaleString('en-IN')}` : ''}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[₹,]/g, '');
                  setFormData({ ...formData, loan_amount: numericValue });
                }}
                placeholder="₹0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMI Date
              </label>
              <input
                type="date"
                value={
                  formData.emi_date
                    ? formData.emi_date.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, emi_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMI Amount
              </label>
              <input
                type="text"
                step="0.01"
                value={formData.emi_amount ? `₹${parseFloat(formData.emi_amount).toLocaleString('en-IN')}` : ''}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[₹,]/g, '');
                  setFormData({ ...formData, emi_amount: numericValue });
                }}
                placeholder="₹0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>
          </div>

          {/* Reference Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-[#1c3430] mb-3">
              Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Name
                </label>
                <input
                  type="text"
                  value={formData.reference_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reference_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Phone
                </label>
                <input
                  type="text"
                  value={formData.reference_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reference_phone: e.target.value,
                    })
                  }
                  placeholder="+91"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.reference_phone ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.reference_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.reference_phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          {/* <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-[#1c3430] mb-3">
              Documents
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Documents
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: PNG, JPG images only (Max 5MB per file)
                </p>
              </div> */}

              {/* Existing Documents Section for Edit Mode */}
              {/* {editingLoan && existingDocuments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Existing Documents ({existingDocuments.length}):</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {existingDocuments.map((doc) => (
                      <div key={doc.id} className="relative group">
                        {doc.mime_type?.startsWith('image/') ? (
                          <div className="relative">
                            <img
                              src={getDocumentUrl(doc.document_name)}
                              alt={doc.original_name}
                              className="w-full h-28 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA2QzkuNzkwODYgNiA4IDcuNzkwODYgOCAxMEM4IDEyLjIwOTEgOS43OTA4NiAxNCAxMiAxNEMxNC4yMDkxIDE0IDE2IDEyLjIwOTEgMTYgMTBDMTYgNy43OTA4NiAxNC4yMDkxIDYgMTIgNlpNMTIgMTJDMTMuMTA0NiAxMiAxNCAxMS4xMDQ2IDE0IDEwQzE0IDguODk1NDMgMTMuMTA0NiA4IDEyIDhDMTAuODk1NCA4IDEwIDguODk1NDMgMTAgMTBDMTAgMTEuMTA0NiAxMC44OTU0IDEyIDEyIDEyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingDocument(doc.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <span className="text-xl flex-shrink-0">
                                {doc.mime_type?.includes('pdf') ? '📄' :
                                 doc.mime_type?.includes('word') || doc.mime_type?.includes('document') ? '📝' :
                                 doc.mime_type?.includes('excel') || doc.mime_type?.includes('spreadsheet') ? '📊' : '📎'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{doc.original_name}</p>
                                <p className="text-xs text-gray-500">
                                  {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingDocument(doc.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 truncate">{doc.original_name}</p>
                          <p className="text-xs text-gray-400">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Selected Files ({selectedFiles.length}):</p>
                    <button
                      type="button"
                      onClick={clearAllFiles}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <span className="text-xl flex-shrink-0">
                                {file.type.includes('pdf') ? '📄' :
                                 file.type.includes('word') || file.type.includes('document') ? '📝' :
                                 file.type.includes('excel') || file.type.includes('spreadsheet') ? '�' : '�'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors flex-shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
            >
              {editingLoan ? "Update Loan" : "Add Loan"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
