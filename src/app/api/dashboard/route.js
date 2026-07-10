import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Helper function to get collection size
    const getCollectionSize = async (colName) => {
      try {
        const snapshot = await getDocs(collection(db, colName));
        return snapshot.size;
      } catch (e) {
        return 0;
      }
    };

    // Get total records
    const totalGST = await getCollectionSize('gst_records');
    const totalIncomeTax = await getCollectionSize('income_tax_records');
    const totalClients = await getCollectionSize('users');
    const totalAccount = await getCollectionSize('accounts');
    const totalOthers = await getCollectionSize('other_records');

    // Get total loans and loan amount for active loans only
    const isActiveLoan = (loanData) => {
      const status = String(loanData?.stage || loanData?.loan_status || '').trim().toUpperCase();
      return status === 'ACTIVE';
    };

    let totalLoans = 0;
    let totalLoanAmount = 0;
    const recentLoans = [];
    try {
      const loansSnapshot = await getDocs(collection(db, 'loans'));
      loansSnapshot.forEach(doc => {
        const data = doc.data();
        const isActive = isActiveLoan(data);

        if (isActive) {
          totalLoans += 1;
          totalLoanAmount += parseFloat(data.loan_amount || 0);
        }

        recentLoans.push({
          id: doc.id,
          name: data.name,
          created_at: data.created_at,
          type: 'Loan'
        });
      });
    } catch (error) {
      console.log('Error fetching loans:', error);
    }

    // Get recent activities for accounts
    const recentAccount = [];
    try {
      const accountSnapshot = await getDocs(collection(db, 'accounts'));
      accountSnapshot.forEach(doc => {
        const data = doc.data();
        recentAccount.push({
          id: doc.id,
          name: data.name,
          created_at: data.created_at,
          type: 'Account'
        });
      });
    } catch (error) { }

    // Get recent activities for others
    const recentOthers = [];
    try {
      const othersSnapshot = await getDocs(collection(db, 'other_records'));
      othersSnapshot.forEach(doc => {
        const data = doc.data();
        recentOthers.push({
          id: doc.id,
          name: data.name,
          created_at: data.created_at,
          type: 'Others'
        });
      });
    } catch (error) { }

    // Combine and sort recent activities
    const allActivities = [
      ...recentLoans,
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 10);

    const dashboardData = {
      stats: {
        totalGST,
        totalLoans,
        totalIncomeTax,
        totalClients,
        totalLoanAmount,
        totalAccount,
        totalOthers
      },
      recentActivities: allActivities
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
