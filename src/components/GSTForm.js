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

  const subjectOptions =
    ['PROPRIETOR', 'PARTNERSHIP', 'INDIVIDUAL', 'COMPANY', 'LLP', 'PRIVATE LIMITED'];
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={handleChange}
                name="company_name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
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

            {/* GST Filing Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Filing Frequency
              </label>
              <select
                value={formData.gst_filing_frequency}
                onChange={handleChange}
                name="gst_filing_frequency"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              >
                <option value="">Select frequency</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
              </select>
            </div>

            {/* GST Filing Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Filing Date
              </label>
              <input
                type="date"
                value={formData.gst_filing_date}
                onChange={handleChange}
                name="gst_filing_date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
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
                  type="text"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                />
              </div>
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
