'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState({
    stats: {
      totalGST: 0,
      totalLoans: 0,
      totalIncomeTax: 0,
      totalClients: 0,
      totalLoanAmount: 0,
      totalAccount: 0,
      totalOthers: 0
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    if (num >= 10000000) {
      return '' + (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
      return '' + (num / 100000).toFixed(2) + ' L';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCardClick = (cardType) => {
    const routes = {
      'GST': '/dashboard/gst',
      'Loan': '/dashboard/loan',
      'Income Tax': '/dashboard/income-tax',
      'Account': '/dashboard/account',
      'Others': '/dashboard/others'
    };

    if (routes[cardType]) {
      window.location.href = routes[cardType];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c3430]"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">

            {/* Loan Card */}
            <div
              onClick={() => handleCardClick('Loan')}
              className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h12M6 8h12M14.5 21L6 13h4.5c4.5 0 4.5-5 0-5" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Loan</p>
                  <p className={`font-bold text-gray-900 ${data.stats.totalLoanAmount > 999999 ? 'text-xl' : 'text-2xl'}`}>
                    {formatCurrency(data.stats.totalLoanAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Income Tax Card */}
            <div
              onClick={() => handleCardClick('Income Tax')}
              className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-500 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-50 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Income Tax</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalIncomeTax?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            {/* GST Card */}
            <div
              onClick={() => handleCardClick('GST')}
              className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">GST</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalGST?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            {/* Others Card */}
            <div
              onClick={() => handleCardClick('Others')}
              className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-500 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-50 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Others</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalOthers?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            {/* Account Card */}
            <div
              onClick={() => handleCardClick('Account')}
              className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-orange-500 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 transform transition-transform"
            >
              <div className="flex items-center">
                <div className="p-3 bg-orange-50 rounded-full">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Account</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalAccount?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Activities Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
            <p className="text-sm text-gray-500">Summary of the latest 10 activities</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!loading && data.recentActivities.length > 0 ? (
                data.recentActivities.map((activity, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors cursor-default">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.type === 'Loan' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                        }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{activity.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(activity.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No recent activities found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


