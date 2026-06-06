"use client";

import { useState, useEffect } from "react";

export default function PolicyForm({ formData, setFormData, onSubmit, onCancel, editingPolicy }) {
    const [loanTypes, setLoanTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoanTypes();
    }, []);

    const fetchLoanTypes = async () => {
        try {
            const response = await fetch("/api/loan-type");
            const data = await response.json();
            if (data.success) {
                setLoanTypes(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching loan types:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-[#1c3430]">
                        {editingPolicy ? "Edit Policy" : "Add New Policy"}
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-semibold text-gray-700">Bank Name</span>
                            <input
                                type="text"
                                required
                                value={formData.bank_name}
                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#dfc797] focus:ring-2 focus:ring-[#dfc797]/30"
                                placeholder="Enter bank name"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-gray-700">Loan Type</span>
                            <select
                                value={formData.loan_type || ""}
                                onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#dfc797] focus:ring-2 focus:ring-[#dfc797]/30"
                                disabled={loading}
                            >
                                <option value="">Select Loan Type</option>
                                {loanTypes.map((type) => (
                                    <option key={type.id} value={type.type_name}>
                                        {type.type_name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-gray-700">Link</span>
                            <input
                                type="url"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#dfc797] focus:ring-2 focus:ring-[#dfc797]/30"
                                placeholder="https://example.com"
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-sm font-semibold text-gray-700">Note</span>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            rows={4}
                            className="mt-2 w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#dfc797] focus:ring-2 focus:ring-[#dfc797]/30"
                            placeholder="Add a short note about this policy"
                        />
                    </label>

                    <div className="flex flex-wrap gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#17312d] text-[#dfc797] rounded-full font-semibold hover:bg-[#142a26] transition-all"
                        >
                            {editingPolicy ? "Update Policy" : "Save Policy"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
