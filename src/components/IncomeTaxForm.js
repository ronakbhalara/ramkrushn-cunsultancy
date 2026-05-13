"use client";

import { useState, useEffect } from "react";

export default function IncomeTaxForm({
  formData,
  setFormData,
  errors,
  onSubmit,
  onCancel,
  editingIncomeTax,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);

  useEffect(() => {
    if (editingIncomeTax) {
      fetchExistingDocuments();
    }
  }, [editingIncomeTax]);

  const fetchExistingDocuments = async () => {
    try {
      const response = await fetch(`/api/income-tax-documents?incomeTaxId=${editingIncomeTax.id}`);
      const data = await response.json();
      if (data.success) {
        setExistingDocuments(data.data);
      }
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isValidType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
      const maxSize = 5 * 1024 * 1024; // 5MB
      const isValidSize = file.size <= maxSize;

      if (isImage && isValidType && isValidSize) {
        validFiles.push(file);
      } else {
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
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingDocument = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/income-tax-documents?id=${documentId}`, {
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
    return `/api/documents/${documentName}`; // Assuming a shared document viewer
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedFiles);
  };

  const getCurrentYear = new Date().getFullYear();
  const assessmentYearOptions = [];
  const currentAssessmentYear = `${getCurrentYear}-${((getCurrentYear + 1) % 100).toString().padStart(2, '0')}`;

  for (let i = 0; i < 60; i++) {
    const year = getCurrentYear + i;
    const nextYear = (year + 1) % 100;
    assessmentYearOptions.push(`${year}-${nextYear.toString().padStart(2, '0')}`);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssessmentYearChange = (year) => {
    setFormData(prev => ({
      ...prev,
      assessment_year: [year]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-[#1c3430] mb-4">
          {editingIncomeTax ? "Edit Income Tax Record" : "Add New Income Tax Record"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                name="name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone No *
              </label>
              <input
                type="text"
                required
                value={formData.phone_no}
                onChange={handleChange}
                name="phone_no"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.phone_no ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.phone_no && <p className="text-red-500 text-xs mt-1">{errors.phone_no}</p>}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Card No
              </label>
              <input
                type="text"
                value={formData.pan_card_no}
                onChange={handleChange}
                name="pan_card_no"
                maxLength="10"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black uppercase ${errors.pan_card_no ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.pan_card_no && <p className="text-red-500 text-xs mt-1">{errors.pan_card_no}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                />
              </div>
            </div>

            {/* Status Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || "Pending"}
                onChange={handleChange}
                className="w-full px-3 py-2 border uppercase border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              >
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Curiyar">Curiyar</option>
              </select>
            </div>

            {/* Stage Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage || "Document Pending"}
                onChange={handleChange}
                className="w-full px-3 py-2 uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              >
                <option value="Document Pending">Document Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Complate">Complate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Name
              </label>
              <input
                type="text"
                value={formData.reference_name}
                onChange={handleChange}
                name="reference_name"
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
                onChange={handleChange}
                name="reference_phone"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.reference_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.reference_phone && <p className="text-red-500 text-xs mt-1">{errors.reference_phone}</p>}
            </div>
            {/* Assessment Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Year</label>
              <select
                value={formData.assessment_year?.[0] || currentAssessmentYear}
                onChange={(e) => {
                  const selectedYear = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    assessment_year: [selectedYear]
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              >
                <option value="">Select assessment year</option>
                {assessmentYearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Note Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note || ""}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black resize-none"
                placeholder="Add any additional information..."
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="border-t pt-4">
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
              </div>

              {/* Existing Documents */}
              {editingIncomeTax && existingDocuments.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">Existing Documents ({existingDocuments.length}):</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {existingDocuments.map((doc) => (
                      <div key={doc.id} className="relative group">
                        <img
                          src={getDocumentUrl(doc.document_name)}
                          alt={doc.original_name}
                          className="w-full h-28 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingDocument(doc.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <p className="mt-1 text-xs text-gray-500 truncate">{doc.original_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">Selected Files ({selectedFiles.length}):</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#dfc797] text-[#17312d] py-2 px-4 rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
            >
              {editingIncomeTax ? "Update Income Tax" : "Add Income Tax"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
