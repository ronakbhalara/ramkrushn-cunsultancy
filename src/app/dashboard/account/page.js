"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import AccountForm from "../../../components/AccountForm";
import { formatDisplayText } from "../../../utils/formatText";

export default function AccountPage() {
  const [accountRecords, setAccountRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentHistory, setPaymentHistory] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [moduleFilter, setModuleFilter] = useState("All");
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    note: "",
    paymentType: "CASH"
  });
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  const [formData, setFormData] = useState({
    number_series: "",
    name: "",
    phone_no: "",
    status: "RECEIPT",
    date_time: "",
    due_date: "",
    payment_type: "",
    note: "",
    pending_amount: "",
    complete_amount: "",
    reference_name: "",
    reference_phone: "",
    payment_note: "",
  });

  const [errors, setErrors] = useState({});

  const getDateInputValue = (value) => {
    if (!value) return "";

    const rawValue = typeof value === "string" ? value.trim() : value;
    if (!rawValue) return "";

    const rawDate = rawValue instanceof Date ? rawValue.toISOString() : String(rawValue);
    const datePart = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) return "";
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getComparableDate = (value) => {
    const dateValue = getDateInputValue(value);
    if (!dateValue) return null;

    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDisplayDate = (value) => {
    const parsedDate = getComparableDate(value);
    if (!parsedDate) return "-";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
      const url = "/api/account";
      const method = editingAccount ? "PUT" : "POST";

      const payload = editingAccount
        ? { ...formData, id: editingAccount.id }
        : formData;

      const normalizedPayload = {
        ...payload,
        date_time: getDateInputValue(formData.date_time),
        due_date: getDateInputValue(formData.due_date),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedPayload),
      });

      const data = await response.json();

      if (data.success) {

        // DAILY HISAB ENTRY CREATE
        if (!editingAccount) {
          const paidAmount = Number.parseFloat(formData.pending_amount || 0);

          if (Number.isFinite(paidAmount) && paidAmount > 0) {
            await fetch("/api/daily-hisab", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                date: getDateInputValue(formData.date_time),
                description: `${formData.name} Account Entry`,
                type: "INCOME",
                amount: paidAmount,
              }),
            });
          }
        }

        toast.success(
          editingAccount
            ? "Account record updated successfully!"
            : "Account record added successfully!"
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

  const filteredAccounts = accountRecords.filter((account) => {
    const series = (account.number_series || "").trim().toUpperCase();

    // Module Filter
    if (moduleFilter !== "All") {
      if (moduleFilter === "Loan" && !series.startsWith("L-")) {
        return false;
      }

      if (moduleFilter === "GST" && !series.startsWith("G-")) {
        return false;
      }

      if (moduleFilter === "Income Tax" && !series.startsWith("I-")) {
        return false;
      }
    }

    // Status Filter
    if (statusFilter !== "ALL" && account.status !== statusFilter) {
      return false;
    }

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      return (
        account.number_series?.toString().toLowerCase().includes(query) ||
        account.name?.toLowerCase().includes(query) ||
        account.phone_no?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      number_series: account.number_series || "",
      name: account.name,
      phone_no: account.phone_no,
      status: account.status,
      date_time: getDateInputValue(account.date_time),
      due_date: getDateInputValue(account.due_date),
      payment_type: account.payment_type,
      pending_amount: account.pending_amount || "",
      complete_amount: account.complete_amount || "",
      reference_name: account.reference_name || "",
      reference_phone: account.reference_phone || "",
      note: account.note || "",
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
      number_series: "",
      name: "",
      phone_no: "",
      status: "RECEIPT",
      date_time: "",
      due_date: "",
      payment_type: "",
      pending_amount: "",
      complete_amount: "",
      reference_name: "",
      reference_phone: "",
      note: "",
    });
    setErrors({});
    setEditingAccount(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const toggleAccountDetails = async (accountId) => {
    if (expandedAccount === accountId) {
      setExpandedAccount(null);
    } else {
      setExpandedAccount(accountId);
      // Fetch payment history for this account
      if (!paymentHistory[accountId]) {
        try {
          const response = await fetch(`/api/account/payments?accountId=${accountId}`);
          const data = await response.json();
          if (data.success) {
            setPaymentHistory(prev => ({ ...prev, [accountId]: data.data }));
          }
        } catch (error) {
          console.error("Failed to fetch payment history", error);
        }
      }
    }
  };

  const handleOpenPaymentModal = (e, account, payment = null) => {
    if (e) e.stopPropagation();
    setSelectedAccount(account);
    const getLocalDateString = (dateObj) => {
      const d = new Date(dateObj);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (payment) {
      setIsEditingPayment(true);
      setEditingPaymentId(payment.id);
      setPaymentFormData({
        amount: payment.amount,
        date: getLocalDateString(payment.payment_date),
        note: payment.note || "",
        paymentType: payment.payment_type || "CASH"
      });
    } else {
      setIsEditingPayment(false);
      setEditingPaymentId(null);
      setPaymentFormData({
        amount: "",
        date: getLocalDateString(new Date()),
        note: "",
        paymentType: "CASH"
      });
    }
    setShowPaymentModal(true);
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentFormData.amount);
    const oldAmount = isEditingPayment ? parseFloat(paymentHistory[selectedAccount.id].find(p => p.id === editingPaymentId).amount) : 0;
    const remaining = parseFloat(selectedAccount.complete_amount || 0) - (parseFloat(selectedAccount.pending_amount || 0) - oldAmount);

    if (!paymentFormData.amount || !paymentFormData.date) {
      toast.warning("Please fill amount and date");
      return;
    }

    if (amount > remaining + 0.01) {
      toast.error(`Payment amount cannot exceed remaining balance of ₹${remaining.toFixed(2)}`);
      return;
    }

    try {
      const url = isEditingPayment ? "/api/account/payments" : "/api/account/payments";
      const method = isEditingPayment ? "PUT" : "POST";
      const payload = isEditingPayment
        ? { id: editingPaymentId, amount, date: paymentFormData.date, note: paymentFormData.note, paymentType: paymentFormData.paymentType }
        : { accountId: selectedAccount.id, amount, date: paymentFormData.date, note: paymentFormData.note, paymentType: paymentFormData.paymentType };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEditingPayment ? "Payment updated successfully!" : "Payment recorded successfully!");
        setShowPaymentModal(false);
        setIsEditingPayment(false);
        setEditingPaymentId(null);
        fetchAccountRecords(); // Refresh account list to show updated paid amount

        // Refresh payment history for this account if it's expanded
        const historyResponse = await fetch(`/api/account/payments?accountId=${selectedAccount.id}`);
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setPaymentHistory(prev => ({ ...prev, [selectedAccount.id]: historyData.data }));
        }
      } else {
        toast.error(data.message || "Failed to add payment");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "-";
    return parseFloat(amount).toFixed(2);
  };

  const getDueDateInfo = (dueDate) => {
    const parsedDueDate = getComparableDate(dueDate);

    if (!parsedDueDate) {
      return { label: "No due date", tone: "text-gray-500", badge: "bg-gray-100 text-gray-600" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return { label: "Invalid date", tone: "text-gray-500", badge: "bg-gray-100 text-gray-600" };
    }

    parsedDueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((parsedDueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue`,
        tone: "text-red-600",
        badge: "bg-red-100 text-red-700",
      };
    }

    if (diffDays === 0) {
      return { label: "Due today", tone: "text-amber-600", badge: "bg-amber-100 text-amber-700" };
    }

    return {
      label: `${diffDays} day${diffDays === 1 ? "" : "s"} remaining`,
      tone: diffDays <= 3 ? "text-amber-600" : "text-green-600",
      badge: diffDays <= 3 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700",
    };
  };

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    const aDate = getComparableDate(a.due_date);
    const bDate = getComparableDate(b.due_date);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return aDate - bDate;
  });

  const exportToExcel = () => {
    const dataToExport = filteredAccounts
      .filter(account => {
        if (statusFilter !== "ALL" && account.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
        if (account.number_series && account.number_series.toString().toLowerCase().includes(query)) return true;
        if (account.name && account.name.toLowerCase().includes(query)) return true;
        if (account.phone_no && account.phone_no.toLowerCase().includes(query)) return true;
        return false;
      })
      .map(account => ({
        "Series Number": account.number_series || "-",
        "Name": account.name || "-",
        "Phone": account.phone_no || "-",
        "Status": account.status || "-",
        "Total Amount": account.complete_amount || 0,
        "Paid Amount": account.pending_amount || 0,
        "Remaining Amount": (parseFloat(account.complete_amount || 0) - parseFloat(account.pending_amount || 0)),
        "Reference Name": account.reference_name || "-",
        "Reference Phone": account.reference_phone || "-",
        "Date": account.date_time ? new Date(account.date_time).toLocaleDateString('en-IN') : "-"
      }));

    if (dataToExport.length === 0) {
      toast.warning("No records to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

    // Auto size columns
    const maxWidths = dataToExport.map(row => Object.values(row).map(val => val.toString().length));
    const colWidths = maxWidths[0].map((_, i) => Math.max(...maxWidths.map(row => row[i])));
    worksheet['!cols'] = colWidths.map(w => ({ wch: w + 2 }));

    XLSX.writeFile(workbook, `Account_Records_${statusFilter}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`);
  };

  const totalRemainingAmount = filteredAccounts.reduce((total, account) => {
    return (
      total +
      (
        parseFloat(account.complete_amount || 0) -
        parseFloat(account.pending_amount || 0)
      )
    );
  }, 0);

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
          {/* Search Bar */}
          <div className="py-1 flex items-center ml-4">
            <input
              type="text"
              placeholder="Search by No., Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 h-8 w-72 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#dfc797]"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm font-medium focus:outline-none focus:border-[#dfc797]"
          >
            <option value="All">All</option>
            <option value="Loan">Loan</option>
            <option value="GST">GST</option>
            <option value="Income Tax">Income Tax</option>
          </select>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 ml-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export to Excel
          </button>
          <div className="bg-red-50 border border-red-200 flex flex-col items-center justify-center rounded-lg p-1 px-4">
            <p className="text-2xl font-bold text-red-600">
              ₹{formatAmount(totalRemainingAmount)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 sm:mt-0 mt-5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
        >
          Add
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
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Remaining Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No {statusFilter.toLowerCase()} account records found. Click "Add New Account" to get started.
                  </td>
                </tr>
              ) : (
                sortedAccounts.map((account) => (
                  <React.Fragment key={account.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleAccountDetails(account.id)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">
                        {account.number_series}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-700">
                        {formatDisplayText(account.name, "-")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <a
                          href={`tel:${account.phone_no}`}
                          className="text-[#17312d] hover:text-[#dfc797] hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {account.phone_no}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${account.status === "PAYMENT"
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
                        {(() => {
                          const dueInfo = getDueDateInfo(account.due_date);
                          return (
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex w-fit px-2 py-1 text-[11px] font-semibold rounded-full ${dueInfo.badge}`}>
                                {formatDisplayDate(account.due_date)}
                              </span>
                              <span className={`text-[11px] font-medium ${dueInfo.tone}`}>
                                {dueInfo.label}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <p className={`font-bold ${parseFloat(account.complete_amount || 0) - parseFloat(account.pending_amount || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                          ₹{formatAmount(parseFloat(account.complete_amount || 0) - parseFloat(account.pending_amount || 0))}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleOpenPaymentModal(e, account)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium transition-colors"
                          >
                            Paid
                          </button>
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
                    {account.note && (
                      <tr
                        className={`cursor-pointer transition-colors`}
                        onClick={() => toggleLoanDetails(account.id)}
                      >
                        <td colSpan="7" className="px-4 pb-3 pt-1 text-xs">
                          <span className="font-bold text-gray-900">Note: </span>
                          <span className="font-semibold text-gray-800">{formatDisplayText(account.note, "-")}</span>
                        </td>
                      </tr>
                    )}
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
                                    <p className="font-medium text-gray-900">{formatDisplayText(account.name, "-")}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{account.phone_no}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span
                                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${account.status === "PAYMENT"
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
                                  <div>
                                    <p className="text-xs text-gray-500">Due Date</p>
                                    <p className="font-medium text-gray-900">{formatDisplayDate(account.due_date)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Amount Information */}
                              <div className="animate-in fade-in-50 duration-500 delay-300">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Amount Information</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Paid Amount</p>
                                    <p className="font-medium text-gray-900">₹{formatAmount(account.pending_amount)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Complete Amount</p>
                                    <p className="font-medium text-gray-900">₹{formatAmount(account.complete_amount)}</p>
                                  </div>
                                  <div className="pt-1 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Remaining Amount</p>
                                    <p className={`font-bold ${parseFloat(account.complete_amount || 0) - parseFloat(account.pending_amount || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                                      ₹{formatAmount(parseFloat(account.complete_amount || 0) - parseFloat(account.pending_amount || 0))}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Reminder</p>
                                    <p className={`font-medium ${getDueDateInfo(account.due_date).tone}`}>
                                      {getDueDateInfo(account.due_date).label}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Reference Information */}
                              <div className="animate-in fade-in-50 duration-500 delay-300">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reference Information</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Reference Name</p>
                                    <p className="font-medium text-gray-900">{account.reference_name || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Reference Phone</p>
                                    <p className="font-medium text-gray-900">{account.reference_phone || "-"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Payment History */}
                              <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4 animate-in fade-in-50 duration-500 delay-400">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-t pt-4">Payment History</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Payment Type</th>
                                        <th className="px-4 py-2">Note</th>
                                        <th className="px-4 py-2">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {paymentHistory[account.id] && paymentHistory[account.id].length > 0 ? (
                                        paymentHistory[account.id].map((payment) => (
                                          <tr key={payment.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{formatDateTime(payment.payment_date)}</td>
                                            <td className="px-4 py-2 font-medium text-gray-900">₹{formatAmount(payment.amount)}</td>
                                            <td className="px-4 py-2 text-xs font-semibold">
                                              <span className={`px-2 py-1 rounded-full ${payment.payment_type === 'CASH' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {payment.payment_type}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2">{payment.note || "-"}</td>
                                            <td className="px-4 py-2">
                                              <button
                                                onClick={(e) => handleOpenPaymentModal(e, account, payment)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                              >
                                                Edit
                                              </button>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="5" className="px-4 py-4 text-center text-gray-400">No payment records found.</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6">
            <h2 className="text-xl font-bold text-[#1c3430] mb-4">
              {isEditingPayment ? "Edit Payment" : "Record Payment"}
            </h2>
            <div className="space-y-1 mb-4">
              <p className="text-sm text-gray-600">Customer: <span className="font-semibold">{selectedAccount?.name}</span></p>
              <p className="text-sm text-gray-600">
                {isEditingPayment ? "Current Account Balance: " : "Remaining Balance: "}
                <span className="font-bold text-red-600">
                  ₹{formatAmount(
                    isEditingPayment
                      ? (parseFloat(selectedAccount?.complete_amount || 0) - (parseFloat(selectedAccount?.pending_amount || 0) - parseFloat(paymentHistory[selectedAccount.id].find(p => p.id === editingPaymentId).amount)))
                      : (parseFloat(selectedAccount?.complete_amount || 0) - parseFloat(selectedAccount?.pending_amount || 0))
                  )}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={paymentFormData.date}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
                <select
                  value={paymentFormData.paymentType}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                >
                  <option value="CASH">CASH</option>
                  <option value="ONLINE">ONLINE</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={paymentFormData.note}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                  placeholder="Optional note"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPayment}
                className="flex-1 bg-[#dfc797] text-[#17312d] py-2 px-4 rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
              >
                {isEditingPayment ? "Update Payment" : "Add Payment"}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
