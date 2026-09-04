import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

// Manager pages
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { ManagerBooks } from '../pages/manager/ManagerBooks';
import { ManagerBookDetails } from '../pages/manager/ManagerBookDetails';
import { ManagerBorrowers } from '../pages/manager/ManagerBorrowers';
import { ManagerBorrowings } from '../pages/manager/ManagerBorrowings';
import { ManagerHistory } from '../pages/manager/ManagerHistory';

// Borrower pages
import { BorrowerDashboard } from '../pages/borrower/BorrowerDashboard';
import { BorrowerCatalog } from '../pages/borrower/BorrowerCatalog';
import { BorrowerBookDetails } from '../pages/borrower/BorrowerBookDetails';
import { BorrowerMyBorrowings } from '../pages/borrower/BorrowerMyBorrowings';
import { BorrowerMyHistory } from '../pages/borrower/BorrowerMyHistory';

export const AppRoutes: React.FC = () => {
  const { role } = useAuth();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Default route redirect */}
        <Route
          path="/"
          element={<Navigate to={role === 'manager' ? '/manager' : '/borrower'} replace />}
        />

        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/books" element={<ManagerBooks />} />
        <Route path="/manager/books/:bookId" element={<ManagerBookDetails />} />
        <Route path="/manager/borrowers" element={<ManagerBorrowers />} />
        <Route path="/manager/borrowings" element={<ManagerBorrowings />} />
        <Route path="/manager/history" element={<ManagerHistory />} />

        {/* Borrower Routes */}
        <Route path="/borrower" element={<BorrowerDashboard />} />
        <Route path="/borrower/catalog" element={<BorrowerCatalog />} />
        <Route path="/borrower/catalog/:bookId" element={<BorrowerBookDetails />} />
        <Route path="/borrower/borrowings" element={<BorrowerMyBorrowings />} />
        <Route path="/borrower/history" element={<BorrowerMyHistory />} />

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={role === 'manager' ? '/manager' : '/borrower'} replace />}
        />
      </Route>
    </Routes>
  );
};
