import React from "react";
import { Menu, ShieldCheck, User } from "lucide-react";
import { API_BASE_URL } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onOpenMobileNav: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileNav,
  title,
  subtitle,
}) => {
  const { role, activeBorrower } = useAuth();

  return (
    <header className="h-14 bg-[#0c0c0e] border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-zinc-100 leading-tight">
            {title ||
              (role === "manager" ? "Espace Gérant" : "Espace Emprunteur")}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 leading-none mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment / API badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px]">
            API: {API_BASE_URL.replace("http://", "")}
          </span>
        </div>

        {/* Current Role badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
          {role === "manager" ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">Mode Gérant</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium truncate max-w-30 sm:max-w-40">
                {activeBorrower ? activeBorrower.name : "Emprunteur"}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
