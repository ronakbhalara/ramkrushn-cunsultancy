"use client";

import { useState, useEffect, useMemo } from "react";
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

  // Selected Series for Layer View
  const [selectedSeriesGroup, setSelectedSeriesGroup] = useState(null);

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

  const getNormalizedSeries = (series) => {
    if (!series) return "UNASSIGNED";
    return String(series).trim().toUpperCase();
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

  useEffect(() => {
    fetchAccountRecords();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.date_time) newErrors.date_time = "Date and time is required";
    if (!formData.payment_type) newErrors.payment_type = "Payment type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
        if (!editingAccount) {
          const paidAmount = Number.parseFloat(formData.pending_amount || 0);
          if (Number.isFinite(paidAmount) && paidAmount > 0) {
            await fetch("/api/daily-hisab", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                date: getDateInputValue(formData.date_time),
                description: `${formData.name} Account Entry`,
                type: "INCOME",
                amount: paidAmount,
              }),
            });
          }
        }

        toast.success(data.message || (editingAccount ? "Account record updated successfully!" : "Account record added successfully!"));
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

  const filteredAccounts = useMemo(() => {
    return accountRecords.filter((account) => {
      const series = getNormalizedSeries(account.number_series);

      if (moduleFilter !== "All") {
        if (moduleFilter === "Loan" && !series.startsWith("L-")) return false;
        if (moduleFilter === "GST" && !series.startsWith("G-")) return false;
        if (moduleFilter === "Income Tax" && !series.startsWith("I-")) return false;
      }

      if (statusFilter !== "ALL" && account.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          account.number_series?.toString().toLowerCase().includes(query) ||
          account.name?.toLowerCase().includes(query) ||
          account.phone_no?.toLowerCase().includes(query) ||
          account.note?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [accountRecords, moduleFilter, statusFilter, searchQuery]);

  // Grouped and sorted series list: Closest Due Date (e.g. 3 days remaining) on TOP
  const groupedSeriesList = useMemo(() => {
    const groups = {};

    filteredAccounts.forEach((account) => {
      const seriesKey = getNormalizedSeries(account.number_series);
      if (!groups[seriesKey]) {
        groups[seriesKey] = {
          seriesKey,
          seriesNumber: account.number_series || seriesKey,
          name: account.name,
          phone_no: account.phone_no,
          latestDueDate: null,
          status: "COMPLETE",
          note: account.note || "",
          totalComplete: 0,
          totalPaid: 0,
          totalRemaining: 0,
          entriesCount: 0,
          records: [],
        };
      }

      const complete = parseFloat(account.complete_amount || 0);
      const paid = parseFloat(account.pending_amount || 0);
      const remaining = complete - paid;

      groups[seriesKey].records.push(account);
      groups[seriesKey].totalComplete += complete;
      groups[seriesKey].totalPaid += paid;
      groups[seriesKey].totalRemaining += remaining;
      groups[seriesKey].entriesCount += 1;

      if (!groups[seriesKey].note && account.note) {
        groups[seriesKey].note = account.note;
      }

      // ફક્ત જે એન્ટ્રીમાં પૈસા બાકી હોય (Remaining > 0), તેની જ સૌથી નજીકની Due Date લાવો
      const accDueDate = getComparableDate(account.due_date);
      const isPendingEntry = String(account.status).toUpperCase() !== 'COMPLETE' && remaining > 0;

      if (accDueDate && isPendingEntry) {
        if (!groups[seriesKey].latestDueDate) {
          groups[seriesKey].latestDueDate = account.due_date;
        } else {
          const currentGroupDueDate = getComparableDate(groups[seriesKey].latestDueDate);
          // જે Due Date સૌથી નજીક (સૌથી નાની તારીખ) હોય તેને પ્રાધાન્ય આપો
          if (accDueDate < currentGroupDueDate) {
            groups[seriesKey].latestDueDate = account.due_date;
          }
        }
      }
    });

    // સ્ટેટસ સેટ પ્રોસેસિંગ
    const result = Object.values(groups).map((group) => {
      const allEntriesComplete = group.records.every(
        (acc) =>
          String(acc.status || "").trim().toUpperCase() === "COMPLETE" ||
          (parseFloat(acc.complete_amount || 0) - parseFloat(acc.pending_amount || 0)) <= 0
      );

      if (allEntriesComplete) {
        group.status = "COMPLETE";
      } else {
        const pendingEntry = group.records.find(
          (acc) => (parseFloat(acc.complete_amount || 0) - parseFloat(acc.pending_amount || 0)) > 0
        );
        group.status = pendingEntry ? pendingEntry.status : "RECEIPT";
      }

      return group;
    });

    // 🔥 TOP SORTING LOGIC: Earliest Due Date (3 days remaining, overdue, etc.) comes FIRST
    result.sort((a, b) => {
      const aIsComplete = a.status === 'COMPLETE' || a.totalRemaining <= 0;
      const bIsComplete = b.status === 'COMPLETE' || b.totalRemaining <= 0;

      // 1. COMPLETE થઈ ગયેલા આઈટમ્સને હંમેશા સૌથી છેલ્લે મોકલો
      if (aIsComplete && !bIsComplete) return 1;
      if (!aIsComplete && bIsComplete) return -1;

      // 2. પેન્ડિંગ આઈટમ્સ માટે Due Date ચકાસો
      const dateA = getComparableDate(a.latestDueDate);
      const dateB = getComparableDate(b.latestDueDate);

      // જેની Due Date સૌથી નજીક હોય (જેમ કે 3 days remaining) તે સૌથી ઉપર આવવી જોઈએ
      if (dateA && dateB) return dateA - dateB;
      if (dateA && !dateB) return -1; // Due date વાળી આઈટમ ઉપર આવશે
      if (!dateA && dateB) return 1;  // Due date વગરની આઈટમ નીચે જશે

      return 0;
    });

    return result;
  }, [filteredAccounts]);

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

  const handleSeriesGroupClick = async (group) => {
    setSelectedSeriesGroup(group);

    group.records.forEach(async (acc) => {
      if (!paymentHistory[acc.id]) {
        try {
          const response = await fetch(`/api/account/payments?accountId=${acc.id}`);
          const data = await response.json();
          if (data.success) {
            setPaymentHistory((prev) => ({ ...prev, [acc.id]: data.data }));
          }
        } catch (error) {
          console.error("Failed to fetch payment history", error);
        }
      }
    });
  };

  const handleOpenPaymentModal = (e, account, payment = null) => {
    if (e) e.stopPropagation();
    setSelectedAccount(account);
    const getLocalDateString = (dateObj) => {
      const d = new Date(dateObj);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
      const url = "/api/account/payments";
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
        fetchAccountRecords();

        const historyResponse = await fetch(`/api/account/payments?accountId=${selectedAccount.id}`);
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setPaymentHistory((prev) => ({ ...prev, [selectedAccount.id]: historyData.data }));
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
    if (amount === null || amount === undefined || amount === "") return "0.00";
    return parseFloat(amount).toFixed(2);
  };

  const getDueDateInfo = (dueDate, status) => {
    if (String(status || '').trim().toUpperCase() === 'COMPLETE') {
      return { label: "", tone: "text-gray-400", badge: "bg-transparent text-gray-400" };
    }

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
        tone: "text-red-600 font-bold",
        badge: "bg-red-100 text-red-700 font-bold",
      };
    }

    if (diffDays === 0) {
      return { label: "Due today", tone: "text-amber-600 font-bold", badge: "bg-amber-100 text-amber-700 font-bold" };
    }

    return {
      label: `${diffDays} day${diffDays === 1 ? "" : "s"} remaining`,
      tone: diffDays <= 3 ? "text-amber-600" : "text-green-600",
      badge: diffDays <= 3 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700",
    };
  };

  const exportToExcel = () => {
    const dataToExport = filteredAccounts.map(account => ({
      "Series Number": account.number_series || "-",
      "Name": account.name || "-",
      "Phone": account.phone_no || "-",
      "Status": account.status || "-",
      "Note": account.note || "-",
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
    XLSX.writeFile(workbook, `Account_Records_${statusFilter}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`);
  };

  const totalRemainingAmount = groupedSeriesList.reduce((total, group) => total + group.totalRemaining, 0);

  const currentSelectedGroup = selectedSeriesGroup
    ? groupedSeriesList.find(g => g.seriesKey === selectedSeriesGroup.seriesKey) || selectedSeriesGroup
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Detailed Layer View */}
      {currentSelectedGroup ? (
        <div className="bg-white rounded-xl shadow-md p-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <button
              onClick={() => setSelectedSeriesGroup(null)}
              className="flex items-center gap-2 bg-[#dfc797] text-[#17312d] px-4 py-2 rounded-lg font-bold hover:bg-[#f0d9ae] transition-colors shadow-sm"
            >
              ← Back to List
            </button>
            <div className="text-right">
              <h2 className="text-xl font-bold text-[#17312d]">
                Series Number: <span className="text-blue-700">{currentSelectedGroup.seriesNumber}</span>
              </h2>
              <p className="text-xs text-gray-500">Total Entries: {currentSelectedGroup.entriesCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h4>
              <p className="text-sm"><span className="text-gray-500">Name:</span> <strong className="text-gray-900">{formatDisplayText(currentSelectedGroup.name, "-")}</strong></p>
              <p className="text-sm"><span className="text-gray-500">Phone:</span> <strong className="text-gray-900">{currentSelectedGroup.phone_no || "-"}</strong></p>
              <p className="text-sm"><span className="text-gray-500">Note:</span> <strong className="text-gray-800">{currentSelectedGroup.note || "-"}</strong></p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Totals Summary</h4>
              <p className="text-sm"><span className="text-gray-500">Total Complete:</span> <strong className="text-gray-900">₹{formatAmount(currentSelectedGroup.totalComplete)}</strong></p>
              <p className="text-sm"><span className="text-gray-500">Total Paid:</span> <strong className="text-green-700">₹{formatAmount(currentSelectedGroup.totalPaid)}</strong></p>
              <p className="text-sm"><span className="text-gray-500">Total Remaining:</span> <strong className="text-red-600">₹{formatAmount(currentSelectedGroup.totalRemaining)}</strong></p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Earliest Due Date Info</h4>
              <p className="text-sm text-gray-800"><span className="">Next Due:</span> <strong>{formatDisplayDate(currentSelectedGroup.latestDueDate)}</strong></p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full ${getDueDateInfo(currentSelectedGroup.latestDueDate, currentSelectedGroup.status).badge}`}>
                {getDueDateInfo(currentSelectedGroup.latestDueDate, currentSelectedGroup.status).label || "Standard"}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-2">
              All Recorded Entries for Series ({currentSelectedGroup.seriesNumber})
            </h3>
            <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">Entry Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment Type</th>
                    <th className="px-4 py-3">Complete Amount</th>
                    <th className="px-4 py-3">Paid Amount</th>
                    <th className="px-4 py-3">Remaining</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentSelectedGroup.records
                    .slice()
                    .sort((a, b) => {
                      const aIsComplete = String(a.status || '').trim().toUpperCase() === 'COMPLETE';
                      const bIsComplete = String(b.status || '').trim().toUpperCase() === 'COMPLETE';

                      // 1. COMPLETE એન્ટ્રીઓને સૌથી છેલ્લે મોકલવા માટે
                      if (aIsComplete && !bIsComplete) return 1;
                      if (!aIsComplete && bIsComplete) return -1;

                      // 2. પેન્ડિંગ એન્ટ્રીઓને Due Date મુજબ સોર્ટ કરવા માટે
                      const dateA = getComparableDate(a.due_date);
                      const dateB = getComparableDate(b.due_date);

                      if (dateA && dateB) return dateA - dateB;
                      if (dateA && !dateB) return -1;
                      if (!dateA && dateB) return 1;

                      return 0;
                    })
                    .map((acc) => {
                      const rem = parseFloat(acc.complete_amount || 0) - parseFloat(acc.pending_amount || 0);
                      const entryDueInfo = getDueDateInfo(acc.due_date, acc.status);

                      return (
                        <React.Fragment key={acc.id}>
                          <tr className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{formatDisplayDate(acc.date_time)}</td>
                            <td className="px-4 py-3">
                              {String(acc.status || '').trim().toUpperCase() === 'COMPLETE' ? (
                                <span className="text-gray-400 text-xs">-</span>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  <span className={`inline-flex w-fit px-2 py-0.5 text-[11px] font-semibold rounded-full ${entryDueInfo.badge}`}>
                                    {formatDisplayDate(acc.due_date)}
                                  </span>
                                  <span className={`text-[10px] ${entryDueInfo.tone}`}>
                                    {entryDueInfo.label}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${acc.status === "PAYMENT" ? "bg-yellow-100 text-yellow-800" :
                                acc.status === "RECEIPT" ? "bg-blue-100 text-blue-800" :
                                  acc.status === "COMPLETE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}>
                                {acc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{acc.payment_type || "-"}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">₹{formatAmount(acc.complete_amount)}</td>
                            <td className="px-4 py-3 text-green-700 font-semibold">₹{formatAmount(acc.pending_amount)}</td>
                            <td className="px-4 py-3 text-red-600 font-bold">₹{formatAmount(rem)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={(e) => handleOpenPaymentModal(e, acc)}
                                  className="px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-semibold"
                                >
                                  Paid
                                </button>
                                <button
                                  onClick={() => handleEdit(acc)}
                                  className="px-2.5 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded hover:bg-[#f0d9ae] font-semibold"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(acc.id)}
                                  className="px-2.5 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>

                          {paymentHistory[acc.id] && paymentHistory[acc.id].length > 0 && (
                            <tr>
                              <td colSpan="9" className="px-6 py-2 bg-gray-50 border-t border-b">
                                <div className="text-xs">
                                  <span className="font-bold text-gray-700">Payment Breakdown ({formatDisplayDate(acc.date_time)}):</span>
                                  <div className="flex gap-4 mt-1 flex-wrap">
                                    {paymentHistory[acc.id].map((p) => (
                                      <div key={p.id} className="bg-white px-3 py-1 rounded border border-gray-200 text-gray-700">
                                        {formatDateTime(p.payment_date)} - <strong className="text-green-700">₹{formatAmount(p.amount)}</strong> ({p.payment_type})
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}

                          <tr>
                            {acc.note && (
                              <td colSpan="9" className="px-6 py-2 bg-gray-50 border-t text-gray-800 text-sm">
                                <span className="font-semibold">Note:</span> {acc.note}
                              </td>
                            )}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Main List View */
        <>
          <div className="flex justify-between flex-wrap items-center mb-6">
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

              <div className="py-1 flex items-center ml-4">
                <input
                  type="text"
                  placeholder="Search by No., Name, Phone, or Note..."
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

          {/* Table List */}
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
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Entries
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {groupedSeriesList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No {statusFilter.toLowerCase()} account records found.
                      </td>
                    </tr>
                  ) : (
                    groupedSeriesList.map((group) => {
                      const dueInfo = getDueDateInfo(group.latestDueDate, group.status);
                      const hasNote = group.note && group.note.trim() !== "";

                      return (
                        <React.Fragment key={group.seriesKey}>
                          {/* Main Row */}
                          <tr
                            className={`hover:bg-amber-50/40 cursor-pointer transition-colors ${!hasNote ? 'border-b border-gray-200' : ''}`}
                            onClick={() => handleSeriesGroupClick(group)}
                          >
                            <td className="px-4 py-3 text-sm font-bold text-[#1c3430]">
                              {group.seriesNumber}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-800">
                              {formatDisplayText(group.name, "-")}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <a
                                href={`tel:${group.phone_no}`}
                                className="text-[#17312d] hover:text-[#dfc797] hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {group.phone_no || "-"}
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${group.status === "PAYMENT"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : group.status === "RECEIPT"
                                    ? "bg-blue-100 text-blue-800"
                                    : group.status === "COMPLETE"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {group.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {String(group.status || '').trim().toUpperCase() === 'COMPLETE' ? (
                                <span className="text-gray-400 text-xs">-</span>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex w-fit px-2 py-1 text-[11px] font-semibold rounded-full ${dueInfo.badge}`}>
                                    {formatDisplayDate(group.latestDueDate)}
                                  </span>
                                  <span className={`text-[11px] font-medium ${dueInfo.tone}`}>
                                    {dueInfo.label}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold">
                              <p className={group.totalRemaining > 0 ? "text-red-600" : "text-green-600"}>
                                ₹{formatAmount(group.totalRemaining)}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-[#dfc797] text-[#17312d] text-xs font-bold px-3 py-1.5 rounded-md hover:bg-[#f0d9ae] transition-colors">
                                View ({group.entriesCount})
                              </span>
                            </td>
                          </tr>

                          {/* Note Row */}
                          {hasNote && (
                            <tr
                              className="hover:bg-amber-50/40 cursor-pointer transition-colors border-b border-gray-200"
                              onClick={() => handleSeriesGroupClick(group)}
                            >
                              <td colSpan="7" className="px-4 pt-1 pb-3 text-sm text-gray-800 bg-gray-50/30">
                                <span className="font-bold">Note: </span>
                                <span>{group.note}</span>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6">
            <h2 className="text-xl font-bold text-[#1c3430] mb-4">
              {isEditingPayment ? "Edit Payment" : "Record Payment"}
            </h2>
            <div className="space-y-1 mb-4">
              <p className="text-sm text-gray-600">Customer: <span className="font-semibold">{selectedAccount?.name}</span></p>
              <p className="text-sm text-gray-600">
                {isEditingPayment ? "Current Balance: " : "Remaining Balance: "}
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