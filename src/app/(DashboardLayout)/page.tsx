'use client';
// components
import ProtectedRoute from '@/app/(DashboardLayout)/components/ProtectedRoute'; // Import the ProtectedRoute component
import Head from 'next/head';

const Dashboard = () => {
  return (
    
    <ProtectedRoute> {/* Wrap the entire dashboard with ProtectedRoute */}
      <Head>
        <link rel="icon" href="@/app/favicon.ico" />
      </Head>
    </ProtectedRoute>
  );
};

export default Dashboard;