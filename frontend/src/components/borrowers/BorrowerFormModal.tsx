import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Borrower } from '@/types';

interface BorrowerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone?: string }) => Promise<void>;
  borrowerToEdit?: Borrower | null;
  isLoading?: boolean;
}

export const BorrowerFormModal: React.FC<BorrowerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  borrowerToEdit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (borrowerToEdit) {
      setName(borrowerToEdit.name);
      setEmail(borrowerToEdit.email);
      setPhone(borrowerToEdit.phone || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
    }
    setErrors({});
  }, [borrowerToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom complet est obligatoire';
    }
    if (!email.trim()) {
      newErrors.email = 'L’adresse email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format d’email invalide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={borrowerToEdit ? 'Modifier l’emprunteur' : 'Inscrire un nouvel emprunteur'}
      description={
        borrowerToEdit
          ? 'Mettez à jour les coordonnées de cet adhérent.'
          : 'Créez un nouveau compte emprunteur pour autoriser les prêts d’ouvrages.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom et prénom"
          placeholder="ex: Thomas Dubois"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Adresse email"
          type="email"
          placeholder="ex: thomas.dubois@acme.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label="Numéro de téléphone"
          type="tel"
          placeholder="ex: +33 6 12 34 56 78"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          helperText="Optionnel pour les rappels d'échéances"
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {borrowerToEdit ? 'Enregistrer' : 'Inscrire l’emprunteur'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
