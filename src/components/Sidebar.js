"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggle,
}) {
  const pathname = usePathname();

  // Proper logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Logged out successfully!");
        window.location.href = "/";
      } else {
        toast.error(data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Network error during logout.");
      window.location.href = "/";
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Loan", href: "/dashboard/loan", icon: "💸" },
    { name: "GST", href: "/dashboard/gst", icon: "📋" },
    { name: "Income TAX", href: "/dashboard/income-tax", icon: "🧾" },
    { name: "Account", href: "/dashboard/account", icon: "👤" },
    // { name: "Tasks", href: "/dashboard/tasks", icon: "📅" },
    { name: "Daily Hisab", href: "/dashboard/daily-hisab", icon: "📈" },
    { name: "Policy", href: "/dashboard/policy", icon: "🛡️" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed top-0 left-0 z-50 h-screen
    ${isCollapsed ? "w-20" : "w-48"}
    bg-[#17312d]
    border-r border-[#29433f]
    transform transition-all duration-300 ease-in-out
    flex flex-col
    shadow-2xl
    overflow-visible
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        {/* Header */}
        <div
          className={`
            relative flex items-center
            ${isCollapsed ? "justify-center h-20" : "justify-center h-28"}
            border-b border-[#29433f]
            px-4
            bg-[#1b3934]
          `}
        >
          {/* Logo */}
          <div
            className={`
              relative flex items-center justify-center overflow-hidden
              ${isCollapsed ? "w-12 h-12" : "w-full h-24"}
            `}
          >
            <Image
              src="/Ramkrishna.png"
              alt="Ramkrishna Consultancy"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 120px, 220px"
            />
          </div>

          {/* Desktop Toggle */}
          <button
            onClick={onToggle}
            className="
              hidden lg:flex
              absolute -right-4 top-1/2 -translate-y-1/2
              w-8 h-8
              bg-[#dfc797]
              rounded-full
              items-center justify-center
              text-[#17312d]
              shadow-lg
              hover:scale-110
              transition-all
              z-50
            "
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className={`flex-1 px-3 py-5 custom-scrollbar ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
          <div className="space-y-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
    group relative flex items-center
    ${isCollapsed ? "justify-center" : ""}
    h-14 rounded-2xl
    transition-all duration-300
    px-2
    overflow-visible
    ${isActive
                      ? "bg-[#dfc797] text-[#17312d] shadow-lg"
                      : "text-[#dfc797] hover:bg-[#244640] hover:text-white"
                    }
  `}
                >
                  <span
                    className={`
                      text-2xl
                      ${isCollapsed ? "" : "mr-4"}
                      transition-transform duration-300
                      group-hover:scale-110
                    `}
                  >
                    {item.icon}
                  </span>

                  {!isCollapsed && (
                    <span className="font-medium text-[15px] whitespace-nowrap">
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip */}
                  {isCollapsed && (
                    <div
                      className="
      absolute left-[85px] top-1/2 -translate-y-1/2
      px-3 py-2
      bg-[#dfc797]
      text-[#17312d]
      text-sm font-semibold
      rounded-lg
      opacity-0 invisible
      group-hover:opacity-100
      group-hover:visible
      transition-all duration-300
      whitespace-nowrap
      shadow-2xl
      z-[99999]
      pointer-events-none
    "
                    >
                      {item.name}

                      <div className="absolute top-1/2 -left-1 w-2 h-2 bg-[#dfc797] rotate-45 -translate-y-1/2" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#29433f] bg-[#17312d]">
          <button
            onClick={handleLogout}
            className={`
              group relative flex items-center
              ${isCollapsed ? "justify-center" : ""}
              w-full h-14 px-4
              rounded-2xl
              bg-[#dfc797]
              text-[#17312d]
              font-semibold
              hover:bg-[#f0d9ae]
              transition-all duration-300
              active:scale-95
            `}
          >
            <svg
              className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>

            {!isCollapsed && <span>Logout</span>}

            {/* Tooltip */}
            {isCollapsed && (
              <div
                className="
      absolute left-[85px] top-1/2 -translate-y-1/2
      px-3 py-2
      bg-[#dfc797]
      text-[#17312d]
      text-sm font-semibold
      rounded-lg
      opacity-0 invisible
      group-hover:opacity-100
      group-hover:visible
      transition-all duration-300
      whitespace-nowrap
      shadow-2xl
      z-[99999]
      pointer-events-none
    "
              >
                Logout
                <div className="absolute top-1/2 -left-1 w-2 h-2 bg-[#dfc797] rotate-45 -translate-y-1/2" />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}