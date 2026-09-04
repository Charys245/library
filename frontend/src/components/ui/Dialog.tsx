import React from "react";
import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button, type ButtonVariant } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  isLoading?: boolean;
  type?: "danger" | "warning" | "info";
  children?: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmVariant = "primary",
  isLoading = false,
  type = "info",
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${
              type === "danger"
                ? "bg-red-950/40 border-red-800/60 text-red-400"
                : type === "warning"
                ? "bg-amber-950/40 border-amber-800/60 text-amber-400"
                : "bg-blue-950/40 border-blue-800/60 text-blue-400"
            }`}
          >
            {type === "danger" || type === "warning" ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {children}

        <div className="flex items-center justify-end gap-2.5 pt-3 mt-2 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
