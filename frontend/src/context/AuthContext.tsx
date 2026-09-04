import React, { createContext, useContext, useState, useEffect, type ReactNode,  } from 'react';
// import { UserRole, Borrower } from '../types';
import { getBorrowers } from '../api/borrowers';
import type { Borrower, UserRole } from '@/types';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeBorrower: Borrower | null;
  setActiveBorrower: (borrower: Borrower) => void;
  availableBorrowers: Borrower[];
  refreshBorrowers: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'lms_current_role';
const BORROWER_STORAGE_KEY = 'lms_active_borrower_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    return saved === 'borrower' ? 'borrower' : 'manager';
  });

  const [availableBorrowers, setAvailableBorrowers] = useState<Borrower[]>([]);
  const [activeBorrower, setActiveBorrowerState] = useState<Borrower | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshBorrowers = async () => {
    try {
      const list = await getBorrowers();
      setAvailableBorrowers(list);

      const savedBorrowerId = localStorage.getItem(BORROWER_STORAGE_KEY);
      const matched = list.find((b) => String(b.id) === String(savedBorrowerId));

      if (matched) {
        setActiveBorrowerState(matched);
      } else if (list.length > 0) {
        setActiveBorrowerState(list[0]);
        localStorage.setItem(BORROWER_STORAGE_KEY, String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load borrowers list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBorrowers();
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const setActiveBorrower = (borrower: Borrower) => {
    setActiveBorrowerState(borrower);
    localStorage.setItem(BORROWER_STORAGE_KEY, String(borrower.id));
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        activeBorrower,
        setActiveBorrower,
        availableBorrowers,
        refreshBorrowers,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
