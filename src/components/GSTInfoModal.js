"use client";

import { useState, useEffect } from "react";

export default function GSTInfoModal({ show, onClose, gstRecord, onSubmit }) {
  const [formData, setFormData] = useState({
    month_year: (() => {
      const currentDate = new Date();
      const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const currentYearShort = currentDate.getFullYear().toString().slice(-2);
      return `${currentMonth}-${currentYearShort}`;
    })(),
    bill_type: "",
    gst_number: gstRecord?.gst_no || "",
    name: gstRecord?.name || "",
    amount: "",
    images: []
  });

  const [existingData, setExistingData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if not in edit mode and existing data exists
    if (existingData && !isEditMode) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving document');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    files.forEach(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getImagePreview = (file) => {
    return URL.createObjectURL(file);
  };

  // Fetch existing data when modal opens
  useEffect(() => {
    if (show && gstRecord?.id) {
      fetchExistingData();
    }
  }, [show, gstRecord]);

  const fetchExistingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gst-documents?gst_record_id=${gstRecord.id}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        // Get the latest document
        const latestDoc = data.data[0];
        setExistingData(latestDoc);
        
        // Populate form with existing data
        setFormData({
          month_year: latestDoc.month_year,
          bill_type: latestDoc.bill_type,
          gst_number: latestDoc.gst_number,
          name: latestDoc.name,
          amount: latestDoc.amount,
          images: []
        });
        setIsEditMode(false);
      } else {
        // No existing data, reset form
        setExistingData(null);
        setIsEditMode(true);
        resetFormToDefault();
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFormToDefault = () => {
    setFormData({
      month_year: (() => {
        const currentDate = new Date();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentYearShort = currentDate.getFullYear().toString().slice(-2);
        return `${currentMonth}-${currentYearShort}`;
      })(),
      bill_type: "",
      gst_number: gstRecord?.gst_no || "",
      name: gstRecord?.name || "",
      amount: "",
      images: []
    });
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleRemoveExistingImage = async (imageIndex) => {
    if (!existingData || !isEditMode) return;
    
    const imagePaths = JSON.parse(existingData.image_paths || '[]');
    const imagePathToRemove = imagePaths[imageIndex];
    
    if (confirm(`Are you sure you want to delete this image?`)) {
      try {
        // Call API to delete image from server and database
        const response = await fetch('/api/gst-documents', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_id: existingData.id,
            image_path: imagePathToRemove,
            image_index: imageIndex
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Update local state
          const updatedImagePaths = imagePaths.filter((_, index) => index !== imageIndex);
          setExistingData(prev => ({
            ...prev,
            image_paths: JSON.stringify(updatedImagePaths)
          }));
        } else {
          alert('Failed to delete image: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error deleting image');
      }
    }
  };

  if (!show) return null;

  // Generate month-year options in MM-YY format
  const generateMonthYearOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    const currentYearShort = currentYear.toString().slice(-2); // 26 for 2026
    
    // Generate options for current and next 11 months
    for (let i = 0; i < 60; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const yearOffset = Math.floor((currentMonth + i) / 12);
      const yearShort = (currentYear + yearOffset).toString().slice(-2);
      const monthNumber = (monthIndex + 1).toString().padStart(2, '0');
      const value = `${monthNumber}-${yearShort}`;
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const label = `${monthNames[monthIndex]}-${yearShort}`;
      
      options.push({ value, label });
    }
    
    return options;
  };

  const monthYearOptions = generateMonthYearOptions();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1c3430]">GST Document Information</h2>
          {existingData && !isEditMode && (
            <button
              type="button"
              onClick={handleEditClick}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Edit'}
            </button>
          )}
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month-Year *
              </label>
              <select
                name="month_year"
                value={formData.month_year}
                onChange={handleChange}
                required
                disabled={existingData && !isEditMode}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${
                  existingData && !isEditMode 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Month-Year</option>
                {monthYearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Type *
              </label>
              <select
                name="bill_type"
                value={formData.bill_type}
                onChange={handleChange}
                required
                disabled={existingData && !isEditMode}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${
                  existingData && !isEditMode 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Bill Type</option>
                <option value="Purchase">Purchase</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number *
              </label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                required
                disabled={existingData && !isEditMode}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black uppercase ${
                  existingData && !isEditMode 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter GST Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={existingData && !isEditMode}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${
                  existingData && !isEditMode 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              disabled={existingData && !isEditMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${
                existingData && !isEditMode 
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter Amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Images *
            </label>
            <input
              type="file"
              name="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              disabled={existingData && !isEditMode}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#dfc797] file:text-[#17312d] hover:file:bg-[#f0d9ae] ${
                existingData && !isEditMode 
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                  : 'border-gray-300'
              }`}
            />
            {formData.images.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.images.length} image(s)
              </p>
            )}
          </div>

          {/* Image Preview Section */}
          {formData.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImagePreview(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={existingData && !isEditMode}
                      className={`absolute top-1 right-1 text-white rounded-full p-1 transition-opacity duration-200 ${
                        existingData && !isEditMode 
                          ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                          : 'bg-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show existing images if any */}
          {existingData?.image_paths && JSON.parse(existingData.image_paths || '[]').length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Images
              </label>
              <div className="grid grid-cols-3 gap-3">
                {JSON.parse(existingData.image_paths).map((imagePath, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`/api/images?path=${encodeURIComponent(imagePath)}`}
                      alt={`Existing Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.className = 'w-full h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center';
                        e.target.innerHTML = `<span class="text-xs text-gray-500 text-center px-2">Image ${index + 1}</span>`;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      disabled={existingData && !isEditMode}
                      className={`absolute top-1 right-1 text-white rounded-full p-1 transition-opacity duration-200 ${
                        existingData && !isEditMode 
                          ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                          : 'bg-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                      {imagePath.split('\\').pop()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || (existingData && !isEditMode)}
              className="flex-1 bg-[#dfc797] text-[#17312d] py-2 px-4 rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (existingData ? 'Update Document' : 'Save Document')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              {existingData && !isEditMode ? 'Close' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
