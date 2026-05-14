"use client";

import { useState } from "react";

export default function HisabForm({
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-[#1c3430] mb-4">
          Add New Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
              className={`flex-1 py-2 rounded-md font-bold transition-all ${formData.type === "EXPENSE"
                  ? "bg-red-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "INCOME" })}
              className={`flex-1 py-2 rounded-md font-bold transition-all ${formData.type === "INCOME"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
              placeholder="What was this for?"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
            >
              Add Entry
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
