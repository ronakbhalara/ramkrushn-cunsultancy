"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PolicyForm from "../../../components/PolicyForm";

export default function PolicyPage() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [loanTypes, setLoanTypes] = useState([]);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [formData, setFormData] = useState({
        bank_name: "",
        link: "",
        note: "",
        loan_type: "",
    });

    useEffect(() => {
        fetchPolicies();
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
        }
    };

    const fetchPolicies = async () => {
        try {
            const response = await fetch("/api/policies");
            const data = await response.json();
            if (data.success) {
                setPolicies(data.data);
            } else {
                toast.error(data.message || "Failed to load policies");
            }
        } catch (error) {
            toast.error("Failed to fetch policies");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const url = editingPolicy ? `/api/policies/${editingPolicy.id}` : "/api/policies";
            const method = editingPolicy ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingPolicy ? "Policy updated successfully" : "Policy added successfully");
                resetForm();
                fetchPolicies();
                setShowForm(false);
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setFormData({
            bank_name: policy.bank_name || "",
            link: policy.link || "",
            note: policy.note || "",
            loan_type: policy.loan_type || "",
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this policy?")) return;

        try {
            const response = await fetch(`/api/policies/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Policy deleted successfully");
                fetchPolicies();
            } else {
                toast.error(data.message || "Failed to delete policy");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const resetForm = () => {
        setFormData({ bank_name: "", link: "", note: "", loan_type: "" });
        setEditingPolicy(null);
    };

    const handleCancel = () => {
        resetForm();
        setShowForm(false);
    };

    const truncateLink = (link, maxLength = 50) => {
        if (!link) return '-';
        if (link.length <= maxLength) return link;
        return link.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Loading policies...</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Policy Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Add, edit, and remove bank policies with link and note details.</p>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:border-[#dfc797] focus:ring-2 focus:ring-[#dfc797]/30"
                    >
                        <option value="ALL">All Loan Types</option>
                        {loanTypes.map((type) => (
                            <option key={type.id} value={type.type_name}>
                                {type.type_name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-5 py-2.5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold shadow-sm transition-all"
                    >
                        + Add Policy
                    </button>
                </div>
            </div>

            {showForm && (
                <PolicyForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    editingPolicy={editingPolicy}
                />
            )}

            <div className="bg-white rounded-3xl shadow-sm overflow-auto border border-gray-100">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bank Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loan Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Link</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Note</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {policies.filter(p => typeFilter === "ALL" || p.loan_type === typeFilter).length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                                    No policies found. Click "Add Policy" to create one.
                                </td>
                            </tr>
                        ) : (
                            policies.filter(p => typeFilter === "ALL" || p.loan_type === typeFilter).map((policy, index) => (
                                <tr key={policy.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-4 py-4 text-sm text-gray-700">{index + 1}</td>
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{policy.bank_name || '-'}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {policy.loan_type || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#17312d] max-w-xs">
                                        {policy.link ? (
                                            <a
                                                href={policy.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={policy.link}
                                                className="hover:underline inline-block truncate"
                                            >
                                                {truncateLink(policy.link)}
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{policy.note || '-'}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600">{policy.created_at ? new Date(policy.created_at).toLocaleDateString('en-IN') : '-'}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleEdit(policy)}
                                                className="px-3 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded-full hover:bg-[#f0d9ae] transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(policy.id)}
                                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
