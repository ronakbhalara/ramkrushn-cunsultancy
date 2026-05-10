"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import AccountForm from "../../../components/AccountForm";

export default function AccountPage() {
  const [accountRecords, setAccountRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    status: "",
    date_time: "",
    payment_type: "",
    pending_amount: "",
    complete_amount: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAccountRecords();
  }, []);

  const fetchAccountRecords = async () => {
    try {
      const response = await fetch("/api/account");
      const data = await response.json();
      if (data.success) {
        setAccountRecords(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch Account records");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Name is required";
    }

    // Phone validation (Indian format: +91 followed by 10 digits or 10 digits)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone_no)) {
      newErrors.phone_no = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    // Date time validation
    if (!formData.date_time) {
      newErrors.date_time = "Date and time is required";
    }

    // Payment type validation
    if (!formData.payment_type) {
      newErrors.payment_type = "Payment type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const url = editingAccount
        ? "/api/account"
        : "/api/account";
      const method = editingAccount ? "PUT" : "POST";

      const payload = editingAccount ? { ...formData, id: editingAccount.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingAccount ? "Account record updated successfully!" : "Account record added successfully!"
        );
        resetForm();
        fetchAccountRecords();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      phone_no: account.phone_no,
      status: account.status,
      date_time: account.date_time,
      payment_type: account.payment_type,
      pending_amount: account.pending_amount || "",
      complete_amount: account.complete_amount || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Account record?")) return;

    try {
      const response = await fetch(`/api/account?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account record deleted successfully!");
        fetchAccountRecords();
      } else {
        toast.error(data.message || "Failed to delete Account record");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_no: "",
      status: "",
      date_time: "",
      payment_type: "",
      pending_amount: "",
      complete_amount: "",
    });
    setErrors({});
    setEditingAccount(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const toggleAccountDetails = (accountId) => {
    setExpandedAccount(expandedAccount === accountId ? null : accountId);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "-";
    return parseFloat(amount).toFixed(2);
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
      <div className="flex justify-between flex-wrap items-center mb-6">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
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
            onClick={() => setStatusFilter("PAYMENT")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "PAYMENT"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Payment
          </button>
          <button
            onClick={() => setStatusFilter("RECEIPT")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "RECEIPT"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Receipt
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
          Add New Account
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AccountForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingAccount={editingAccount}
        />
      )}

      {/* Account Records Table */}
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
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accountRecords.filter(account => statusFilter === "ALL" || account.status === statusFilter).length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No {statusFilter.toLowerCase()} account records found. Click "Add New Account" to get started.
                  </td>
                </tr>
              ) : (
                accountRecords
                  .filter(account => statusFilter === "ALL" || account.status === statusFilter)
                  .map((account) => (
                    <React.Fragment key={account.id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleAccountDetails(account.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">
                          {account.number_series}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {account.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {account.phone_no}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              account.status === "PAYMENT"
                                ? "bg-yellow-100 text-yellow-800"
                                : account.status === "RECEIPT"
                                  ? "bg-blue-100 text-blue-800"
                                  : account.status === "COMPLETE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {account.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDateTime(account.date_time)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              account.payment_type === "CASH"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {account.payment_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(account);
                              }}
                              className="px-3 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded hover:bg-[#f0d9ae] font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(account.id);
                              }}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedAccount === account.id && (
                        <tr className="animate-in slide-in-from-top-1 duration-300">
                          <td colSpan="7" className="px-0 py-0">
                            <div className="bg-gray-50 border-l-4 border-[#dfc797] p-6 shadow-inner transform transition-all duration-300 ease-in-out overflow-hidden">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="animate-in slide-in-from-top-2 duration-500 delay-100">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Name</p>
                                      <p className="font-medium text-gray-900">{account.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Phone</p>
                                      <p className="font-medium text-gray-900">{account.phone_no}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Status</p>
                                      <span
                                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                          account.status === "PAYMENT"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : account.status === "RECEIPT"
                                              ? "bg-blue-100 text-blue-800"
                                              : account.status === "COMPLETE"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {account.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Information */}
                                <div className="animate-in fade-in-50 duration-500 delay-200">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Information</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Date & Time</p>
                                      <p className="font-medium text-gray-900">{formatDateTime(account.date_time)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Payment Type</p>
                                      <span
                                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                          account.payment_type === "CASH"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-orange-100 text-orange-800"
                                        }`}
                                      >
                                        {account.payment_type}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Amount Information */}
                                <div className="animate-in fade-in-50 duration-500 delay-300">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Amount Information</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Pending Amount</p>
                                      <p className="font-medium text-gray-900">₹{formatAmount(account.pending_amount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Complete Amount</p>
                                      <p className="font-medium text-gray-900">₹{formatAmount(account.complete_amount)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
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
