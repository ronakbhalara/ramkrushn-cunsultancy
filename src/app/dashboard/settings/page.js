"use client";

import LoanStatus from "../../../components/Setting/LoanStatus";
import LoanType from "../../../components/Setting/LoanType";

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LoanStatus />
      <LoanType />
    </div>
  );
}
