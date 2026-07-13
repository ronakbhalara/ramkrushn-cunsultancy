"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function TaskForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingTask,
}) {
  const [searchValue, setSearchValue] = useState(formData.title || "");
  const [searchMessage, setSearchMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [isCustomerAutoPopulated, setIsCustomerAutoPopulated] = useState(false);

  useEffect(() => {
    setSearchValue(formData.title || "");
  }, [formData.title]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSearchLoan = async () => {
    const value = searchValue.trim();
    if (!value) {
      toast.error("Please enter a loan serial number");
      return;
    }

    try {
      setSearching(true);
      const response = await fetch("/api/loans");
      const data = await response.json();

      if (!data.success) {
        setSearchMessage("Unable to search loans right now");
        return;
      }

      const normalizedValue = value.toLowerCase();
      const loan = (data.data || []).find((item) => {
        const series = String(item.number_series || "").toLowerCase();
        return series === normalizedValue;
      });

      if (loan) {
        setFormData({
          ...formData,
          title: loan.number_series || value,
          customer_name: loan.name || "",
          customer_phone: loan.phone_no || "",
        });
        setIsCustomerAutoPopulated(true);
        setSearchMessage(`Customer found: ${loan.name || "-"}`);
      } else {
        setFormData({
          ...formData,
          title: value,
          customer_name: "",
          customer_phone: "",
        });
        setIsCustomerAutoPopulated(false);
        setSearchMessage("No matching loan found");
      }
    } catch (error) {
      setSearchMessage("Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-[#1c3430]">
            {editingTask ? "Edit Task" : "Add New Task"}
          </h2>
          <div className="w-full max-w-xs">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search Loan No.
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                placeholder="L-1"
              />
              <button
                type="button"
                onClick={handleSearchLoan}
                disabled={searching}
                className="px-3 py-2 bg-[#17312d] text-[#dfc797] rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {searching ? "..." : "Find"}
              </button>
            </div>
            {searchMessage && <p className="text-xs mt-1 text-gray-500">{searchMessage}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                disabled={isCustomerAutoPopulated}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black ${isCustomerAutoPopulated
                  ? "bg-gray-100 border-gray-200 text-gray-700"
                  : "focus:ring-2 focus:ring-[#dfc797] focus:border-transparent"
                  }`}
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={formData.customer_phone}
                onChange={(e) =>
                  setFormData({ ...formData, customer_phone: e.target.value })
                }
                disabled={isCustomerAutoPopulated}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black ${isCustomerAutoPopulated
                  ? "bg-gray-100 border-gray-200 text-gray-700"
                  : "focus:ring-2 focus:ring-[#dfc797] focus:border-transparent"
                  }`}
                placeholder="Mobile number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              placeholder="Enter task note"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
            >
              {editingTask ? "Update Task" : "Add Task"}
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
