import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  History,
  Library,
  ShieldCheck,
  User,
  ArrowRightLeft,
  BookMarked,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';


interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { role, setRole, activeBorrower, setActiveBorrower, availableBorrowers } = useAuth();
  const navigate = useNavigate();

  const managerLinks = [
    { to: '/manager', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true },
    { to: '/manager/books', label: 'Livres', icon: BookOpen },
    { to: '/manager/borrowers', label: 'Emprunteurs', icon: Users },
    { to: '/manager/borrowings', label: 'Emprunts en cours', icon: ArrowLeftRight },
    { to: '/manager/history', label: 'Historique global', icon: History },
  ];

  const borrowerLinks = [
    { to: '/borrower', label: 'Mon espace', icon: LayoutDashboard, end: true },
    { to: '/borrower/catalog', label: 'Catalogue des livres', icon: BookMarked },
    { to: '/borrower/borrowings', label: 'Mes emprunts', icon: ArrowLeftRight },
    { to: '/borrower/history', label: 'Mon historique', icon: History },
  ];

  const currentLinks = role === 'manager' ? managerLinks : borrowerLinks;

  const handleRoleToggle = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'manager') {
      navigate('/manager');
    } else {
      navigate('/borrower');
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="h-full flex flex-col bg-neutral-950 border-r border-neutral-800/80 text-neutral-300 w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold shadow-sm">
            <Library className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-100 tracking-tight leading-none">
              Library OS
            </h1>
            <p className="text-[11px] text-neutral-500 font-mono mt-0.5 leading-none">
              v2.4 • FastAPI Client
            </p>
          </div>
        </div>
      </div>

      {/* Role Indicator & Quick Switcher */}
      <div className="p-3 border-b border-neutral-800/60 bg-neutral-900/40">
        <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400 mb-1.5 px-1">
          <span>Rôle actif</span>
          <span className="text-neutral-500 text-[10px]">Changer</span>
        </div>
        <div className="grid grid-cols-2 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
          <button
            type="button"
            onClick={() => handleRoleToggle('manager')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              role === 'manager'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gérant</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('borrower')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              role === 'borrower'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Emprunteur</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {role === 'manager' ? 'Administration' : 'Portail Lecteur'}
        </div>
        {currentLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white font-semibold border border-neutral-800 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-neutral-400" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/30">
        {role === 'manager' ? (
          <div className="flex items-center gap-3 p-2 rounded-md border border-neutral-800/60 bg-neutral-900/60">
            <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 text-xs font-semibold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-200 truncate leading-tight">
                Direction Bibliothèque
              </p>
              <p className="text-[11px] text-neutral-500 truncate leading-tight mt-0.5">
                admin@library.internal
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
              <span className="text-neutral-500">Emprunteur actif :</span>
            </div>
            <select
              value={activeBorrower?.id || ''}
              onChange={(e) => {
                const b = availableBorrowers.find((item) => String(item.id) === e.target.value);
                if (b) setActiveBorrower(b);
              }}
              className="w-full text-xs bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              {availableBorrowers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.email})
                </option>
              ))}
            </select>
            {activeBorrower && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 px-1">
                <CheckCircle2 className="w-3 h-3" />
                <span className="truncate">Profil synchronisé</span>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
