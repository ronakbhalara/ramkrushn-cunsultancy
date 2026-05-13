"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function AccountForm({
  formData,
  setFormData,
  errors,
  onSubmit,
  onCancel,
  editingAccount,
}) {
  const [searching, setSearching] = useState(false);
  const [seriesNumber, setSeriesNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const statusOptions = ['PAYMENT', 'RECEIPT', 'COMPLETE'];
  const paymentTypeOptions = ['CASH', 'ONLINE'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSeriesSearch = async () => {
    if (!seriesNumber.trim()) {
      toast.warning("Please enter a series number");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/search-series?series=${seriesNumber.trim().toUpperCase()}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          ...formData,
          name: data.data.name || "",
          phone_no: data.data.phone_no || "",
          reference_name: data.data.reference_name || "",
          reference_phone: data.data.reference_phone || "",
        });
        toast.success("Details auto-filled from series number!");
      } else {
        toast.error(data.message || "Series number not found");
      }
    } catch (error) {
      toast.error("Error searching series number");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-[#1c3430]">
            {editingAccount ? "Edit Account Record" : "Add New Account Record"}
          </h2>

          {!editingAccount && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Series No (e.g. L-01)"
                value={seriesNumber}
                onChange={(e) => setSeriesNumber(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-sm text-black"
              />
              <button
                type="button"
                onClick={handleSeriesSearch}
                disabled={searching}
                className="px-3 py-1.5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          )}
        </div>

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
                disabled
                className={`w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-black ${errors.name ? 'border-red-500' : 'border-gray-300'
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
                disabled
                className={`w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-black ${errors.phone_no ? 'border-red-500' : 'border-gray-300'
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
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-black"
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
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-black"
              />
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date_time}
                onChange={handleChange}
                name="date_time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type *
              </label>
              <select
                required
                value={formData.payment_type}
                onChange={handleChange}
                name="payment_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              >
                <option value="">Select payment type</option>
                {paymentTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complete Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.complete_amount}
                onChange={handleChange}
                name="complete_amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.pending_amount}
                onChange={handleChange}
                name="pending_amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Note
              </label>
              <textarea
                value={formData.payment_note}
                onChange={handleChange}
                name="payment_note"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                placeholder="Enter note for the initial payment"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#dfc797] text-[#17312d] py-2 px-4 rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
            >
              {editingAccount ? "Update Account" : "Add Account"}
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
