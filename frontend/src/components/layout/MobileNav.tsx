import React from "react";
// import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AnimatePresence,motion } from "framer-motion";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10"
          >
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-100 bg-neutral-900 border border-neutral-800"
                aria-label="Fermer le menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar onCloseMobile={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
