import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get total GST records
    const gstResult = await pool.query('SELECT COUNT(*) as count FROM gst_records');
    const totalGST = parseInt(gstResult.rows[0].count);

    // Get total loans
    const loansResult = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(loan_amount), 0) as total_amount FROM loans');
    const totalLoans = parseInt(loansResult.rows[0].count);
    const totalLoanAmount = parseFloat(loansResult.rows[0].total_amount);

    // Get total income tax records
    const incomeTaxResult = await pool.query('SELECT COUNT(*) as count FROM income_tax_records');
    const totalIncomeTax = parseInt(incomeTaxResult.rows[0].count);

    // Get total users/clients
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalClients = parseInt(usersResult.rows[0].count);

    // Get total account records
    let totalAccount = 0;
    try {
      const accountResult = await pool.query('SELECT COUNT(*) as count FROM accounts');
      totalAccount = parseInt(accountResult.rows[0].count);
    } catch (error) {
      console.log('Account records table does not exist yet');
      totalAccount = 0;
    }

    // Get total other records
    let totalOthers = 0;
    try {
      const othersResult = await pool.query('SELECT COUNT(*) as count FROM other_records');
      totalOthers = parseInt(othersResult.rows[0].count);
    } catch (error) {
      console.log('Other records table does not exist yet');
      totalOthers = 0;
    }

    // Get recent activities (latest 10 records from all tables)
    const recentLoans = await pool.query(
      'SELECT id, name, created_at, \'Loan\' as type FROM loans ORDER BY created_at DESC LIMIT 5'
    );

    let recentAccount = { rows: [] };
    try {
      recentAccount = await pool.query(
        'SELECT id, name, created_at, \'Account\' as type FROM accounts ORDER BY created_at DESC LIMIT 5'
      );
    } catch (error) {
      console.log('Account records table does not exist yet');
    }

    let recentOthers = { rows: [] };
    try {
      recentOthers = await pool.query(
        'SELECT id, name, created_at, \'Others\' as type FROM other_records ORDER BY created_at DESC LIMIT 5'
      );
    } catch (error) {
      console.log('Other records table does not exist yet');
    }

    // Combine and sort recent activities
    const allActivities = [
      ...recentLoans.rows,
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

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
