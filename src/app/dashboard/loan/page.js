"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import LoanForm from "../../../components/LoanForm";
import DocumentsSection from "../../../components/DocumentsSection";

export default function LoanPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    email_id: "",
    loan_status: "",
    loan_type: "",
    reference_name: "",
    reference_phone: "",
    stage: "ACTIVE",
    bank_name: "",
    loan_ac_no: "",
    loan_amount: "",
    emi_date: "",
    emi_amount: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch("/api/loans");
      const data = await response.json();
      if (data.success) {
        setLoans(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Phone validation (Indian format: +91 followed by 10 digits or 10 digits)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone_no)) {
      newErrors.phone_no = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email_id && !emailRegex.test(formData.email_id)) {
      newErrors.email_id = "Please enter a valid email address";
    }

    // Reference Phone validation (Indian format: +91 followed by 10 digits or 10 digits)
    if (formData.reference_phone && !phoneRegex.test(formData.reference_phone)) {
      newErrors.reference_phone = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (selectedFiles) => {
    if (!validateForm()) {
      return;
    }

    try {
      const submitFormData = new FormData();

      // Add all form fields
      submitFormData.append('name', formData.name);
      submitFormData.append('phone_no', formData.phone_no);
      submitFormData.append('email_id', formData.email_id);
      submitFormData.append('loan_status', formData.loan_status);
      submitFormData.append('loan_type', formData.loan_type);
      submitFormData.append('reference_name', formData.reference_name);
      submitFormData.append('reference_phone', formData.reference_phone);
      submitFormData.append('stage', formData.stage);
      submitFormData.append('bank_name', formData.bank_name);
      submitFormData.append('loan_ac_no', formData.loan_ac_no);
      submitFormData.append('loan_amount', formData.loan_amount);
      submitFormData.append('emi_date', formData.emi_date);
      submitFormData.append('emi_amount', formData.emi_amount);
      submitFormData.append('notes', formData.notes);

      // Add files if any
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          submitFormData.append('files', file);
        });
      }

      const url = editingLoan
        ? `/api/loans/${editingLoan.id}`
        : "/api/loans";
      const method = editingLoan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitFormData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingLoan ? "Loan updated successfully!" : "Loan added successfully!"
        );
        resetForm();
        fetchLoans();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData({
      name: loan.name,
      phone_no: loan.phone_no,
      email_id: loan.email_id || "",
      loan_status: loan.loan_status || "",
      loan_type: loan.loan_type || "",
      reference_name: loan.reference_name || "",
      reference_phone: loan.reference_phone || "",
      stage: loan.stage,
      bank_name: loan.bank_name || "",
      loan_ac_no: loan.loan_ac_no || "",
      loan_amount: loan.loan_amount,
      emi_date: loan.emi_date || "",
      emi_amount: loan.emi_amount || "",
      notes: loan.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this loan?")) return;

    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Loan deleted successfully!");
        fetchLoans();
      } else {
        toast.error(data.message || "Failed to delete loan");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_no: "",
      email_id: "",
      loan_status: "",
      loan_type: "",
      reference_name: "",
      reference_phone: "",
      stage: "ACTIVE",
      bank_name: "",
      loan_ac_no: "",
      loan_amount: "",
      emi_date: "",
      emi_amount: "",
      notes: "",
    });
    setErrors({});
    setEditingLoan(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const toggleLoanDetails = (loanId) => {
    setExpandedLoan(expandedLoan === loanId ? null : loanId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="sm:flex block justify-between items-center mb-6">
        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "ALL"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "ACTIVE"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETE")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "COMPLETE"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Complete
          </button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 sm:mt-0 mt-5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
        >
          Add New Loan
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <LoanForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingLoan={editingLoan}
        />
      )}

      {/* Loans Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loan Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loan Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  EMI Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loans.filter(loan => statusFilter === "ALL" || loan.stage === statusFilter).length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No {statusFilter === "ALL" ? "" : statusFilter.toLowerCase()} loans found. Click "Add New Loan" to get started.
                  </td>
                </tr>
              ) : (
                loans
                  .filter(loan => statusFilter === "ALL" || loan.stage === statusFilter)
                  .map((loan) => (
                    <React.Fragment key={loan.id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleLoanDetails(loan.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">
                          {loan.number_series}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {loan.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {loan.phone_no}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.stage === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : loan.stage === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                              }`}
                          >
                            {loan.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {loan.loan_type || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          ₹{parseFloat(loan.loan_amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {loan.emi_date ? new Date(loan.emi_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(loan);
                              }}
                              className="px-3 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded hover:bg-[#f0d9ae] font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(loan.id);
                              }}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedLoan === loan.id && (
                        <tr className="animate-in slide-in-from-top-1 duration-300">
                          <td colSpan="9" className="px-0 py-0">
                            <div className="bg-gray-50 border-l-4 border-[#dfc797] p-6 shadow-inner transform transition-all duration-300 ease-in-out overflow-hidden">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="animate-in slide-in-from-top-2 duration-500 delay-100">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Name</p>
                                      <p className="font-medium text-gray-900">{loan.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Phone</p>
                                      <p className="font-medium text-gray-900">{loan.phone_no}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Email</p>
                                      <p className="font-medium text-gray-900">{loan.email_id || "-"}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Loan Information */}
                                <div className="animate-in fade-in-50 duration-500 delay-200">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Loan Information</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Bank Name</p>
                                      <p className="font-medium text-gray-900">{loan.bank_name || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Loan Account</p>
                                      <p className="font-medium text-gray-900">{loan.loan_ac_no || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Loan Amount</p>
                                      <p className="font-medium text-gray-900">₹{parseFloat(loan.loan_amount).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">EMI Amount</p>
                                      <p className="font-medium text-gray-900">₹{parseFloat(loan.emi_amount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Reference Information */}
                                <div className="animate-in fade-in-50 duration-500 delay-300">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reference Information</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Reference Name</p>
                                      <p className="font-medium text-gray-900">{loan.reference_name || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Reference Phone</p>
                                      <p className="font-medium text-gray-900">{loan.reference_phone || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Loan Status</p>
                                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                        {loan.loan_status || "-"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Loan Type</p>
                                      <p className="font-medium text-gray-900">{loan.loan_type || "-"}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Documents Section */}
                              <DocumentsSection loanId={loan.id} />

                              {loan.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in-50 duration-500 delay-400">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                                  <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200 transform transition-all duration-300 hover:shadow-md">{loan.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

