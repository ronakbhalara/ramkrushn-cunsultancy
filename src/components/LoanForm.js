"use client";

import { useState } from "react";

export default function LoanForm({
  formData,
  setFormData,
  errors,
  onSubmit,
  onCancel,
  editingLoan,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
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
                <option value="PENDING">Pending</option>
                <option value="COMPLETE">Complete</option>
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
