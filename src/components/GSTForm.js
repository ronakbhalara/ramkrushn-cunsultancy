"use client";

import { useState } from "react";

export default function GSTForm({
  formData,
  setFormData,
  errors,
  onSubmit,
  onCancel,
  editingGST,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const subjectOptions = ['PROPERTY', 'PARTNERSHIP', 'BUSINESS', 'PROFESSIONAL', 'OTHER'];
  const assessmentYearOptions = [
    '2025-26',
    '2026-27',
    '2027-28',
    '2028-29',
    '2029-30',
    '2030-31'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssessmentYearChange = (year) => {
    setFormData(prev => ({
      ...prev,
      assessment_year: prev.assessment_year?.includes(year)
        ? prev.assessment_year.filter((y) => y !== year)
        : [...(prev.assessment_year || []), year]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-[#1c3430] mb-4">
          {editingGST ? "Edit GST Record" : "Add New GST Record"}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${
                  errors.phone_no ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone_no && <p className="text-red-500 text-xs mt-1">{errors.phone_no}</p>}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${
                  errors.reference_phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.reference_phone && <p className="text-red-500 text-xs mt-1">{errors.reference_phone}</p>}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black uppercase ${
                  errors.pan_card_no ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pan_card_no && <p className="text-red-500 text-xs mt-1">{errors.pan_card_no}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={handleChange}
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              >
                <option value="">Select subject</option>
                {subjectOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST No
              </label>
              <input
                type="text"
                value={formData.gst_no}
                onChange={handleChange}
                name="gst_no"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={formData.user_id}
                onChange={handleChange}
                name="user_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Assessment Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Year</label>
            <div className="grid grid-cols-3 gap-2">
              {assessmentYearOptions.map(year => (
                <label key={year} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.assessment_year?.includes(year) || false}
                    onChange={() => handleAssessmentYearChange(year)}
                    className="rounded border-gray-300 text-[#dfc797] focus:ring-[#dfc797]"
                  />
                  <span className="text-sm text-gray-700">{year}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#dfc797] text-[#17312d] py-2 px-4 rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
            >
              {editingGST ? "Update GST" : "Add GST"}
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
